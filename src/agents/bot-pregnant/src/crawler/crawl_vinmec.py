import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from typing import List, Dict
import os
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
}

BASE_URL = "https://www.vinmec.com/vie/ket-qua-tim-kiem/"


# =========================
# REQUEST HELPER (có retry + Selenium cho JS)
# =========================
def fetch_url(url, params=None, retries=3, delay=2, use_selenium=False):
    if use_selenium:
        return fetch_url_selenium(url, params, retries, delay)
    
    for attempt in range(retries):
        try:
            res = requests.get(url, params=params, headers=HEADERS, timeout=10)
            if res.status_code == 200:
                return res
        except Exception as e:
            print(f"[Retry {attempt+1}] Lỗi: {e}")
            if attempt < retries - 1:
                time.sleep(delay)
    return None


def fetch_url_selenium(url, params=None, retries=3, delay=2):
    """Dùng Selenium để render JavaScript"""
    for attempt in range(retries):
        driver = None
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            driver = webdriver.Chrome(options=chrome_options)
            
            full_url = url
            if params:
                query_string = "&".join([f"{k}={v}" for k, v in params.items()])
                full_url = f"{url}?{query_string}"
            
            driver.get(full_url)
            
            # Chờ các element load
            WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, "f18.bold.mb2"))
            )
            
            # Lấy HTML sau khi render
            html = driver.page_source
            return type('Response', (), {'content': html.encode(), 'status_code': 200, 'driver': driver})()
            
        except Exception as e:
            print(f"[Selenium Retry {attempt+1}] Lỗi: {e}")
            if attempt < retries - 1:
                time.sleep(delay)
        finally:
            if driver:
                driver.quit()
    
    return None


# =========================
# LẤY NỘI DUNG FULL
# =========================
def get_article_full(url: str) -> str:
    try:
        res = fetch_url(url)
        if not res:
            return "Lỗi tải trang"

        soup = BeautifulSoup(res.content, "html.parser", from_encoding="utf-8")
        content_div = soup.find("div", id="main-article")

        if not content_div:
            return "Không tìm thấy nội dung"

        # Lấy text từ tất cả các element, loại bỏ script và style
        for script in content_div(["script", "style"]):
            script.decompose()

        text = content_div.get_text(separator="\n", strip=True)
        return text
    except Exception as e:
        print(f"Lỗi khi lấy nội dung từ {url}: {e}")
        return f"Lỗi: {str(e)}"


# =========================
# TÁCH CHUNK THEO H2/H3
# =========================
def get_article_chunks(url: str) -> List[Dict]:
    try:
        res = fetch_url(url)
        if not res:
            return []

        soup = BeautifulSoup(res.content, "html.parser", from_encoding="utf-8")
        main_div = soup.find("div", id="main-article")

        if not main_div:
            return []

        chunks = []
        current_header = "Lời mở đầu"
        current_content = []

        # Lấy tất cả các heading (h2, h3) và paragraph
        for element in main_div.find_all(['h2', 'h3', 'p']):
            if element.name in ['h2', 'h3']:
                # Lưu chunk trước đó nếu có nội dung
                if current_content:
                    chunks.append({
                        "Mục": current_header,
                        "Nội dung": "\n".join(current_content)
                    })
                # Bắt đầu chunk mới
                current_header = element.get_text(strip=True)
                current_content = []

            elif element.name == 'p':
                text = element.get_text(strip=True)
                # Lọc bỏ các text không cần thiết
                if text and "HOTLINE" not in text and "TẠI ĐÂY" not in text and "MyVinmec" not in text:
                    current_content.append(text)

        # Lưu chunk cuối cùng
        if current_content:
            chunks.append({
                "Mục": current_header,
                "Nội dung": "\n".join(current_content)
            })

        return chunks
    except Exception as e:
        print(f"Lỗi khi tách chunk từ {url}: {e}")
        return []


# =========================
# LẤY DANH SÁCH BÀI VIẾT (dùng click pagination)
# =========================
def search_articles(keyword: str, max_results=30, start_from=0) -> List[Dict]:
    results = []
    seen_links = set()
    skipped = 0
    page = 1
    driver = None

    print(f"\n🔍 Tìm keyword: {keyword}")

    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        driver = webdriver.Chrome(options=chrome_options)
        
        # Truy cập trang tìm kiếm
        search_url = f"{BASE_URL}?q={keyword}"
        print(f"  📍 Trang 1: {search_url}")
        driver.get(search_url)
        
        # Chờ articles load
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "f18.bold.mb2"))
        )
        
        while len(results) < max_results:
            time.sleep(1)
            
            # Lấy HTML hiện tại
            soup = BeautifulSoup(driver.page_source, "html.parser")
            articles = soup.find_all("a", class_="f18 bold mb2")
            print(f"  📊 Tìm thấy {len(articles)} bài viết trên trang {page}")

            if not articles:
                print(f"  ⚠️ Không tìm thấy bài viết nào, dừng tìm kiếm")
                break

            for i, art in enumerate(articles):
                # Lấy text từ thẻ a
                title = art.get_text(strip=True)
                link = art.get("href")
                
                if not link or not title:
                    continue
                
                link = "https://www.vinmec.com" + link

                # Lọc tiêu đề - chỉ lấy bài liên quan đến thai kỳ/mẹ bầu
                pregnancy_keywords = ["mẹ", "bà bầu", "bầu", "thai", "mang thai", "thai kỳ", "mang", "bé", "em bé"]
                non_pregnancy_keywords = ["cây bầu", "bầu dưa", "bầu xanh", "bầu nâu"]
                
                title_lower = title.lower()
                
                # Nếu chứa từ khóa không liên quan đến thai kỳ, bỏ qua
                if any(kw in title_lower for kw in non_pregnancy_keywords):
                    continue
                
                # Nếu không chứa từ khóa thai kỳ, bỏ qua
                if not any(kw in title_lower for kw in pregnancy_keywords):
                    continue

                if link in seen_links:
                    continue

                # ✅ SKIP bài trước đó
                if skipped < start_from:
                    skipped += 1
                    continue

                seen_links.add(link)

                results.append({
                    "keyword": keyword,
                    "title": title,
                    "link": link
                })

                print(f"  ✅ {title[:60]}")
                print(f"     🔗 {link}")

                if len(results) >= max_results:
                    break

            if len(results) >= max_results:
                break

            # Click nút trang tiếp theo
            try:
                # Tìm nút ">" (next page)
                next_button = driver.find_element(By.XPATH, "//a[@class='item_paging' and contains(text(), '>')]")
                
                # Scroll đến element
                driver.execute_script("arguments[0].scrollIntoView(true);", next_button)
                time.sleep(0.5)
                
                # Thử click bình thường trước
                try:
                    next_button.click()
                except:
                    # Nếu click bình thường không được, dùng JavaScript click
                    driver.execute_script("arguments[0].click();", next_button)
                
                page += 1
                print(f"  📍 Trang {page}: Click next button")
                
                # Chờ articles load
                WebDriverWait(driver, 10).until(
                    EC.presence_of_all_elements_located((By.CLASS_NAME, "f18.bold.mb2"))
                )
            except Exception as e:
                print(f"  ⚠️ Không có trang tiếp theo hoặc lỗi click: {e}")
                break

    finally:
        if driver:
            driver.quit()

    return results


# =========================
# MAIN CRAWL
# =========================
def crawl_vinmec(keywords: List[str], limit_each=100, output_dir="data/raw/vinmec", start_from=31):
    full_data = []
    chunk_data = []

    # Tạo thư mục output nếu chưa tồn tại
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    for kw in keywords:
        articles = search_articles(kw, limit_each, start_from=start_from)

        for art in articles:
            print(f"\n📄 Đang crawl: {art['title'][:60]}")

            # FULL CONTENT
            full_content = get_article_full(art['link'])

            full_data.append({
                "Từ khóa": art["keyword"],
                "Tiêu đề": art["title"],
                "Link": art["link"],
                "Nội dung": full_content
            })

            # CHUNK
            chunks = get_article_chunks(art["link"])
            for ch in chunks:
                chunk_data.append({
                    "Từ khóa": art["keyword"],
                    "Tiêu đề": art["title"],
                    "Mục": ch["Mục"],
                    "Nội dung chunk": ch["Nội dung"],
                    "Link": art["link"]
                })

            time.sleep(1)

    # =========================
    # SAVE FILE
    # =========================
    try:
        if full_data:
            df_full = pd.DataFrame(full_data)
            full_path = output_path / "vinmec_full.xlsx"
            df_full.to_excel(full_path, index=False)
            print(f"✅ Lưu full articles: {full_path}")
        else:
            print("⚠️ Không có dữ liệu full để lưu")

        if chunk_data:
            df_chunk = pd.DataFrame(chunk_data)
            chunk_path = output_path / "vinmec_chunked.xlsx"
            df_chunk.to_excel(chunk_path, index=False)
            print(f"✅ Lưu chunks: {chunk_path}")
        else:
            print("⚠️ Không có dữ liệu chunk để lưu")

        print("\n✅ DONE!")
        print(f"- Full articles: {len(full_data)}")
        print(f"- Chunks: {len(chunk_data)}")
    except Exception as e:
        print(f"❌ Lỗi khi lưu file: {e}")


# =========================
# RUN
# =========================
if __name__ == "__main__":
    crawl_vinmec(["bầu", "bé"], limit_each=100)