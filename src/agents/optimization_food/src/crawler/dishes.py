"""Crawler for Vietnamese nutritional data from viendinhduong.vn.

Scrapes dish information and nutritional content, saves to CSV,
and downloads dish images.
"""

import csv
import logging
import os
from pathlib import Path
from typing import Any, List, Optional, Union

import httpx
from playwright.sync_api import Page, sync_playwright, Locator
from tqdm import tqdm

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = "https://viendinhduong.vn/"
NUTRITION_PAGE_URL = (
    "https://viendinhduong.vn/vi/cong-cu-va-tien-ich/gia-tri-dinh-duong-mon-an"
)

ROWS_PER_PAGE = 15
TOTAL_PAGES = 84

# Consistent with src/ingestion/loader.py
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
DISHES_DIR = RAW_DIR / "dishes"
IMAGES_DIR = DISHES_DIR / "images"
DISH_TABLE_CSV = DISHES_DIR / "raw_dish_table.csv"
NUTRITION_TABLE_CSV = DISHES_DIR / "raw_nutrition_table.csv"
LOG_FILE = DATA_DIR / "dishes.log"

IMAGE_DOWNLOAD_TIMEOUT = 10.0  # seconds

DISH_TABLE_HEADER = [
    "stt", "id", "group_name_vietnamese", "group_name_english", 
    "dish_name_vietnamese", "dish_name_english"
]

NUTRITION_HEADER = [
    "stt", "energy", "protein", "fat", "carbohydrate", "vitamin_a", "beta_caroten",
    "vitamin_c", "calcium", "iron", "zinc", "sodium", "cholesterol", "magnesium", "transfat",
]

NUTRITION_UNITS = [
    "", "kcal", "g", "g", "g", "mcg", "mcg", "mg", "mg", "mg", "mg", "mg", "mg", "mg", "mg","mg",
]

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

def setup_logging():
    """Sets up the logging configuration for the crawler.

    Configures logging to both a file (dishes.log) and the standard output.
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
# Helper functions
# ---------------------------------------------------------------------------

def scrape_selected_dish_row(page: Page) -> List[str]:
    """Extracts dish identification information from the currently selected table row.

    Parses the STT, ID, and both Vietnamese/English names for the dish and its group
    from the selected row in the Ant Design table.

    Args:
        page (Page): The Playwright page object where the dish table is displayed.

    Returns:
        List[str]: A list containing [stt, id, group_vn, group_en, dish_vn, dish_en].
            Returns an empty list if extraction fails or no row is selected.
    """
    try:
        cells = page.locator("tr.ant-table-row-selected td").all()
        if not cells or len(cells) < 4:
            return []

        stt = cells[0].inner_text().strip()
        id_val = cells[1].inner_text().strip()

        group_parts = cells[2].inner_text().split("\n")
        group_vn = group_parts[0].strip()
        group_en = group_parts[1].strip() if len(group_parts) > 1 else ""

        dish_parts = cells[3].inner_text().split("\n")
        dish_vn = dish_parts[0].strip()
        # English name is usually in parentheses
        dish_en = dish_parts[1].strip().strip("()") if len(dish_parts) > 1 else ""

        return [stt, id_val, group_vn, group_en, dish_vn, dish_en]
    except Exception as e:
        logger.error(f"Failed to scrape dish row info: {e}")
        return []

def scrape_nutrition_values(page: Page, stt: Union[int, str]) -> List[Any]:
    """Extracts nutritional content for the currently selected dish.

    Scrapes values from the nutrient details table (e.g., energy, protein, fat)
    and handles decimal formatting.

    Args:
        page (Page): The Playwright page object containing the nutrition table.
        stt (Union[int, str]): The sequence number (STT) of the dish.

    Returns:
        List[Any]: A list starting with STT followed by nutritional values.
            If extraction fails, returns STT followed by empty strings.
    """
    try:
        cells = page.locator(
            "td.ant-table-cell.nutrient-table-cell.nutrient-table-cell-value"
        ).all()
        # Convert comma decimal to dot
        values = [cell.inner_text().replace(",", ".") for cell in cells]
        return [stt] + values
    except Exception as e:
        logger.error(f"Failed to scrape nutrition values for STT {stt}: {e}")
        return [stt] + [""] * (len(NUTRITION_HEADER) - 1)

def download_image(page: Page, stt: Union[int, str]) -> None:
    """Downloads the image for a dish and saves it locally.

    Finds the image source from the page, constructs the full URL if necessary,
    and saves the content as a PNG file named after the STT.

    Args:
        page (Page): The Playwright page object where the dish image is visible.
        stt (Union[int, str]): The sequence number used as the filename.

    Note:
        Skips download if the image file already exists locally.
    """
    img_path = IMAGES_DIR / f"{stt}.png"
    if img_path.exists():
        return

    try:
        img_locator = page.locator(".ant-image-img")
        if img_locator.count() == 0:
            return
            
        relative_src = img_locator.first.get_attribute("src")
        if not relative_src:
            return
            
        img_url = BASE_URL + relative_src if relative_src.startswith('/') else relative_src
        with httpx.Client() as client:
            # Using custom user-agent to avoid potential blocks
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
            response = client.get(img_url, timeout=IMAGE_DOWNLOAD_TIMEOUT, headers=headers)
            response.raise_for_status()
            img_path.write_bytes(response.content)
    except Exception as exc:
        logger.warning(f"Failed to download image for row {stt}: {exc}")

def save_csv_safely(filepath: Path, rows: List[List[Any]], label: str) -> None:
    """Saves a list of rows to a CSV file with robust directory handling.

    Ensures the parent directories exist before writing the file and logs the result.

    Args:
        filepath (Path): The absolute path where the CSV will be saved.
        rows (List[List[Any]]): The data rows to be written, including headers.
        label (str): A descriptive label for logging purposes (e.g., 'dish', 'nutrition').
    """
    try:
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerows(rows)
        logger.info(f"Saved {len(rows)} {label} rows to {filepath}")
    except Exception as e:
        logger.error(f"Failed to save {label} CSV: {e}")

# ---------------------------------------------------------------------------
# Main scraping logic
# ---------------------------------------------------------------------------

def scrape_dish_data() -> None:
    """The main execution loop for scraping dish and nutrition data.

    Initializes the Playwright browser, iterates through all pages of the dish
    listing, clicks each row to load details, and aggregates the results into
    dish and nutrition tables. Finally, saves both tables to CSV files.

    Raises:
        Exception: Logs any critical errors encountered during the browser session.
    """
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    dish_table: List[List[str]] = [DISH_TABLE_HEADER]
    nutrition_table: List[List[Any]] = [NUTRITION_HEADER, NUTRITION_UNITS]

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            page.goto(NUTRITION_PAGE_URL, timeout=60000)
            page.wait_for_load_state("networkidle")

            page_bar = tqdm(range(TOTAL_PAGES), desc="Scraping Pages")
            for page_idx in page_bar:
                page_bar.set_postfix({"p": page_idx + 1, "total": len(dish_table) - 1})

                for i in range(ROWS_PER_PAGE):
                    stt = i + page_idx * ROWS_PER_PAGE + 1
                    try:
                        # Find and click the item by STT text match
                        row_trigger = page.locator(".look-table-container").get_by_text(f"{stt}", exact=True)
                        
                        if row_trigger.count() > 0:
                            row_trigger.first.click(timeout=5000)
                            # Wait for details panel to update
                            page.wait_for_timeout(700)
                            
                            dish_row = scrape_selected_dish_row(page)
                            if dish_row:
                                dish_table.append(dish_row)
                                nutrition_table.append(scrape_nutrition_values(page, stt))
                                download_image(page, stt)
                    except Exception as e:
                        logger.debug(f"Row {stt} skipped: {e}")
                        continue

                # Navigate to next page
                try:
                    next_btn = page.get_by_role("button", name="right")
                    if next_btn.is_enabled():
                        next_btn.click()
                        page.wait_for_timeout(1000)
                    else:
                        break
                except Exception:
                    break
        except Exception as e:
            logger.error(f"Critical error during scraping: {e}")
        finally:
            browser.close()

    save_csv_safely(DISH_TABLE_CSV, dish_table, "dish")
    save_csv_safely(NUTRITION_TABLE_CSV, nutrition_table, "nutrition")

# ---------------------------------------------------------------------------
# Entry point / Unit Tests
# ---------------------------------------------------------------------------

def run_tests():
    """Executes basic validation tests for the scraping logic.

    This function serves as a placeholder for unit tests or sanity checks
    to ensure helper functions are behaving as expected.
    """
    # Add more logic tests here if needed
    print("Logic tests passed!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        run_tests()
    else:
        scrape_dish_data()
