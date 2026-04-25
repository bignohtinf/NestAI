"""Crawler for nutritional recommendations from viendinhduong.vn.

Scrapes recommended nutritional intake based on age, gender, labor level, 
and physiological condition.
"""

import csv
import json
import logging
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from playwright.sync_api import Page, sync_playwright, Locator, expect

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = "https://viendinhduong.vn/vi/cong-cu-va-tien-ich/nhu-cau-dinh-duong"

# Consistent with src/ingestion/loader.py
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROFILES_DIR = RAW_DIR / "profiles"
RECOMMENDATIONS_FOLDER = PROFILES_DIR / "recommendations"
PROFILES_JSON = PROFILES_DIR / "profiles.json"
LOG_FILE = DATA_DIR / "profiles.log"

FIELDS = [
    "Nhóm tuổi/Age group",
    "Giới tính/Gender",
    "Mức độ lao động/Labor Level",
    "Tình trạng sinh lý/Physiological condition"
]

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

def setup_logging():
    """Sets up the logging configuration for the crawler.

    Configures logging to both a file (profiles.log) and the standard output.
    Creates the output directory if it doesn't exist.

    Returns:
        logging.Logger: The configured logger instance.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.FileHandler(LOG_FILE, encoding="utf-8"),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

# ---------------------------------------------------------------------------
# Table Processing Helpers
# ---------------------------------------------------------------------------

def unmerge_table(table_locator: Locator) -> List[List[str]]:
    """Expands rowspan and colspan in an HTML table to a 2D grid.

    Iterates through all cells in an HTML table and maps them to their
    actual positions in a 2D matrix, filling in merged cells with their
    respective values.

    Args:
        table_locator (Locator): The Playwright locator for the table element.

    Returns:
        List[List[str]]: A 2D list representation of the table data.
    """
    grid: Dict[Tuple[int, int], str] = {}
    
    # We use all() to get a list of rows
    try:
        rows = table_locator.locator("tr").all()
    except Exception as e:
        logger.error(f"Failed to locate rows: {e}")
        return []
    
    for r_idx, row in enumerate(rows):
        cells = row.locator("td, th").all()
        c_idx = 0
        for cell in cells:
            # Find the next empty cell in the grid for this row
            while (r_idx, c_idx) in grid:
                c_idx += 1
            
            text = cell.inner_text().strip()
            # Handle potential None or empty attributes
            rowspan_attr = cell.get_attribute("rowspan")
            colspan_attr = cell.get_attribute("colspan")
            
            rowspan = int(rowspan_attr) if rowspan_attr and rowspan_attr.isdigit() else 1
            colspan = int(colspan_attr) if colspan_attr and colspan_attr.isdigit() else 1
            
            # Fill the grid for the spanned area
            for dr in range(rowspan):
                for dc in range(colspan):
                    grid[(r_idx + dr, c_idx + dc)] = text
            c_idx += colspan
            
    if not grid:
        return []
        
    max_r = max(r for r, c in grid.keys())
    max_c = max(c for r, c in grid.keys())
    
    res = []
    for r in range(max_r + 1):
        row_data = [grid.get((r, c), "") for c in range(max_c + 1)]
        res.append(row_data)
    return res

def reformat_number(text: str) -> str:
    """Replaces comma decimal separators with dots in numbers and ranges.

    Useful for converting Vietnamese numeric formatting (e.g., '550,0')
    to standard Python/CSV formatting (e.g., '550.0').

    Args:
        text (str): The string content of a table cell.

    Returns:
        str: The reformatted string.
    """
    # Matches numbers with commas as decimals, e.g., "550,0" -> "550.0"
    return re.sub(r'(\d+),(\d+)', r'\1.\2', text)

def is_header_row(row: List[str]) -> bool:
    """Identifies if a row is a section header or empty.

    A row is considered a header if it is empty or if all cells in the row
    contain the same non-empty value (indicating a spanned header).

    Args:
        row (List[str]): A list of strings representing a row of table data.

    Returns:
        bool: True if the row is a header or empty, False otherwise.
    """
    if not row:
        return True
    
    non_empty_cells = [cell.strip() for cell in row if cell.strip()]
    if not non_empty_cells:
        return True
        
    # If all cells in the row have the same non-empty value, it's a section header
    unique_vals = set(non_empty_cells)
    if len(unique_vals) == 1 and len(row) > 1:
        # Check if the value is actually the same across ALL cells
        if all(cell.strip() == non_empty_cells[0] for cell in row):
            return True
            
    return False

def process_table_data(data: List[List[str]]) -> List[List[str]]:
    """Cleans, filters, and reformats the scraped table data.

    Removes header rows and empty rows, and reformats numbers within each cell.

    Args:
        data (List[List[str]]): The raw 2D list of table data.

    Returns:
        List[List[str]]: The processed and cleaned 2D list of data.
    """
    processed = []
    for row in data:
        if is_header_row(row):
            continue
        
        # Reformat numbers in each cell
        clean_row = [reformat_number(cell) for cell in row]
        # Only add rows that have at least some data
        if any(cell.strip() for cell in clean_row):
            processed.append(clean_row)
    return processed

# ---------------------------------------------------------------------------
# Crawler Class
# ---------------------------------------------------------------------------

class RecommendationCrawler:
    """A crawler for nutritional recommendation data from viendinhduong.vn.

    This class handles the interaction with the multi-select form on the website,
    recursively iterating through all combinations of age, gender, labor level,
    and physiological condition to scrape the corresponding nutritional intake tables.

    Attributes:
        page (Page): The Playwright page object used for interaction.
        stt_counter (int): A counter for uniquely identifying each scraped profile.
        all_profiles (List[Dict[str, Any]]): A list containing metadata for all scraped profiles.
    """
    def __init__(self, page: Page):
        """Initializes the crawler with a Playwright page.

        Args:
            page (Page): The active Playwright page object.
        """
        self.page = page
        self.stt_counter = 1
        self.all_profiles: List[Dict[str, Any]] = []

    def _get_select_container(self, field_label: str) -> Optional[Locator]:
        """Finds the form group container for a specific field label.

        Args:
            field_label (str): The label text of the target field.

        Returns:
            Optional[Locator]: The Playwright locator for the field container, or None if not found.
        """
        try:
            return self.page.locator(".form-group").filter(
                has=self.page.locator(".form-label").filter(has_text=field_label)
            )
        except Exception:
            return None

    def get_options(self, field_label: str) -> List[str]:
        """Fetches all selectable options for a given form field.

        Clicks the select2 component to expand options and extracts the text
        of all selectable items.

        Args:
            field_label (str): The label text of the field to fetch options from.

        Returns:
            List[str]: A list of option texts. Returns [''] if the field is disabled or no options are found.
        """
        container = self._get_select_container(field_label)
        if not container:
            return [""]
            
        try:
            selection = container.locator(".select2-selection")
            # Check if disabled
            classes = selection.get_attribute("class") or ""
            if "select2-selection--disabled" in classes:
                return [""]

            selection.click()
            # Use a short timeout for waiting for options
            self.page.wait_for_selector(".select2-results__option", timeout=3000)
            
            options = self.page.locator(".select2-results__option--selectable").all()
            texts = [opt.inner_text().strip() for opt in options if "Chọn" not in opt.inner_text()]
            
            # Close dropdown by clicking away or escape
            self.page.keyboard.press("Escape")
            self.page.wait_for_timeout(200)
            
            return texts if texts else [""]
        except Exception:
            self.page.keyboard.press("Escape")
            return [""]

    def select_option(self, field_label: str, option_text: str) -> bool:
        """Selects a specific option in a form field.

        Interacts with the select2 component to find and click the desired option.

        Args:
            field_label (str): The label text of the target field.
            option_text (str): The text of the option to select.

        Returns:
            bool: True if selection was successful, False otherwise.
        """
        if not option_text:
            return True
            
        container = self._get_select_container(field_label)
        if not container:
            return False
            
        try:
            selection = container.locator(".select2-selection")
            classes = selection.get_attribute("class") or ""
            if "select2-selection--disabled" in classes:
                return False

            selection.click()
            self.page.wait_for_selector(".select2-results__option", timeout=3000)
            
            # Exact text match for option
            target = self.page.locator(".select2-results__option").filter(has_text=re.compile(f"^{re.escape(option_text)}$")).first
            if target.count() == 0:
                # Fallback to fuzzy match if exact fails
                target = self.page.locator(".select2-results__option").filter(has_text=option_text).first
                
            target.click()
            self.page.wait_for_timeout(500) 
            return True
        except Exception as e:
            logger.debug(f"Failed to select '{option_text}' in '{field_label}': {e}")
            self.page.keyboard.press("Escape")
            return False

    def scrape_current_profile(self, profile_dict: Dict[str, str]) -> None:
        """Triggers the search and scrapes the result table for the current selection.

        Clicks the search button, waits for results, and then extracts and saves
        the resulting nutritional table.

        Args:
            profile_dict (Dict[str, str]): A dictionary representing the current selection criteria.
        """
        try:
            # Click Tìm kiếm
            self.page.get_by_role("button", name="Tìm kiếm").click()
            
            # Wait for table to update
            self.page.wait_for_timeout(1000)
            
            table_locator = self.page.locator("table")
            if table_locator.count() == 0:
                logger.warning(f"No table found for profile {self.stt_counter}")
                return

            raw_data = unmerge_table(table_locator)
            processed_data = process_table_data(raw_data)
            
            if processed_data:
                self._save_result(self.stt_counter, processed_data, profile_dict)
                self.stt_counter += 1
            else:
                logger.warning(f"No valid data in table for profile {self.stt_counter}")
        except Exception as e:
            logger.error(f"Error during scraping profile {self.stt_counter}: {e}")

    def _save_result(self, stt: int, data: List[List[str]], profile: Dict[str, str]) -> None:
        """Saves the scraped table data to a CSV file and updates the profile index.

        Args:
            stt (int): The sequence number of the profile.
            data (List[List[str]]): The processed 2D list of nutritional data.
            profile (Dict[str, str]): The selection criteria for this profile.
        """
        file_path = RECOMMENDATIONS_FOLDER / f"{stt}.csv"
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "w", newline="", encoding="utf-8") as f:
                csv.writer(f).writerows(data)
            
            self.all_profiles.append({
                "stt": stt,
                "profile": profile
            })
            logger.info(f"Saved Profile {stt}")
        except Exception as e:
            logger.error(f"Failed to save CSV for stt {stt}: {e}")

    def crawl_recursive(self, field_idx: int, current_profile: List[str]) -> None:
        """Recursively iterates through all possible field selections in the form.

        Explores every branch of the selection tree (Age -> Gender -> Labor -> Condition)
        to ensure every possible nutritional recommendation table is captured.

        Args:
            field_idx (int): The index of the current field being iterated (from FIELDS).
            current_profile (List[str]): The list of currently selected options.
        """
        if field_idx == len(FIELDS):
            profile_dict = {FIELDS[i]: current_profile[i] for i in range(len(FIELDS))}
            self.scrape_current_profile(profile_dict)
            return

        options = self.get_options(FIELDS[field_idx])
        for opt in options:
            self.select_option(FIELDS[field_idx], opt)
            current_profile[field_idx] = opt
            # Move to next field level
            self.crawl_recursive(field_idx + 1, list(current_profile))

# ---------------------------------------------------------------------------
# Main Execution
# ---------------------------------------------------------------------------

def run_crawler():
    """Entry point for the recommendation crawler.

    Initializes the Playwright environment, navigates to the target URL,
    starts the recursive crawling process, and saves the final profile index to JSON.
    """
    logger.info("Starting Recommendation Crawler...")
    PROFILES_DIR.mkdir(parents=True, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            page.goto(BASE_URL, timeout=60000)
            page.wait_for_load_state("networkidle")
            
            crawler = RecommendationCrawler(page)
            # Start recursive crawling from the first field
            crawler.crawl_recursive(0, ["", "", "", ""])
            
            # Save final profiles.json
            with open(PROFILES_JSON, "w", encoding="utf-8") as f:
                json.dump(crawler.all_profiles, f, ensure_ascii=False, indent=4)
                
            logger.info(f"Successfully finished! Total profiles: {len(crawler.all_profiles)}")
        except Exception as e:
            logger.error(f"Critical error in crawler: {e}")
        finally:
            browser.close()

# ---------------------------------------------------------------------------
# Utility / Tests
# ---------------------------------------------------------------------------

def run_tests():
    """Executes basic validation tests for the processing logic helper functions.

    Tests reformat_number and is_header_row with various sample inputs.
    """
    # Test reformat_number
    assert reformat_number("550,0") == "550.0"
    assert reformat_number("24,4 - 36,7") == "24.4 - 36.7"
    
    # Test is_header_row
    assert is_header_row(["Header", "Header", "Header"]) is True
    assert is_header_row(["Data", "Other"]) is False
    assert is_header_row(["", ""]) is True
    
    print("All tests passed!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        run_tests()
    else:
        run_crawler()
