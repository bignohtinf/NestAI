"""
cleaner.py
Xử lý dữ liệu thô (PDF + XLSX) → Markdown (.md) cho RAG pipeline.

Sources:
  data/raw/reproductive_health_care.pdf  → data/processed/reproductive_health_care.md
  data/raw/vinmec/vinmec_full.xlsx       → data/processed/vinmec/<slug>.md (mỗi bài 1 file)
  data/raw/vinmec/vinmec_chunked.xlsx    → bổ sung heading structure cho từng bài
"""

import re
import unicodedata
from pathlib import Path
import pandas as pd

# ─────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parents[2]   # bot-pregnant/
RAW_DIR  = BASE_DIR / "data" / "raw"
PROC_DIR = BASE_DIR / "data" / "processed"

PDF_PATH          = RAW_DIR / "health_care" / "reproductive_health_care.pdf"
XLSX_FULL_PATH    = RAW_DIR / "vinmec" / "vinmec_full.xlsx"
XLSX_CHUNKED_PATH = RAW_DIR / "vinmec" / "vinmec_chunked.xlsx"

# ─────────────────────────────────────────
# PATTERNS để nhận diện phần sách
# ─────────────────────────────────────────
_RE_TOC     = re.compile(r"MỤC\s*LỤC", re.IGNORECASE)
_RE_ABBREV  = re.compile(
    r"(DANH\s*MỤC\s*)?CHỮ\s*VIẾT\s*TẮT|TỪ\s*VIẾT\s*TẮT|VIẾT\s*TẮT",
    re.IGNORECASE,
)
_RE_CHAPTER = re.compile(
    r"^(CHƯƠNG|BÀI|PHẦN)\s+[\dIVXivx]+",
    re.MULTILINE,
)
_RE_SECTION_NUM = re.compile(r"^\d+\.\d+\.?\s+\S")
_RE_ALL_CAPS_VN = re.compile(
    r"^[A-ZĐÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ\s\d,.:;()/\-–]{5,80}$"
)

# Patterns cho heading detection
_RE_CHAPTER_HEADING = re.compile(r"^(CHƯƠNG|BÀI|PHẦN)\s+[\dIVXivx]+", re.IGNORECASE)


# ─────────────────────────────────────────
# TEXT UTILITIES
# ─────────────────────────────────────────
def clean_text(text: str) -> str:
    """Chuẩn hoá text: bỏ soft-hyphen, nối từ bị gãy dòng, thu gọn khoảng trắng."""
    text = text.replace("\xad", "")           # soft hyphen
    text = re.sub(r"-\n(\w)", r"\1", text)    # nối từ bị gãy
    text = re.sub(r"\n{3,}", "\n\n", text)    # nhiều dòng trống → 2
    text = re.sub(r"[ \t]{2,}", " ", text)    # nhiều space → 1
    return text.strip()


def slugify(text: str) -> str:
    """Tạo tên file an toàn từ tiêu đề tiếng Việt."""
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text[:80]


def is_all_caps_vn(line: str) -> bool:
    """Kiểm tra dòng có phải tiêu đề viết hoa toàn bộ (tiếng Việt)."""
    stripped = line.strip()
    if len(stripped) < 5 or len(stripped) > 80:
        return False
    upper = stripped.upper()
    return stripped == upper and any(c.isalpha() for c in stripped)


def get_heading_level(line: str) -> int | None:
    """
    Xác định level heading dựa vào pattern:
    CHƯƠNG/BÀI/PHẦN ... → level 1
    ALL-CAPS (không số)  → level 2
    1.                   → level 3
    1.1                  → level 4
    1.1.1                → level 5
    1.1.1.1              → level 6
    """
    s = line.strip()
    
    # CHƯƠNG/BÀI/PHẦN
    if _RE_CHAPTER_HEADING.match(s):
        return 1
    
    # ALL-CAPS (không chứa số ở đầu)
    if is_all_caps_vn(s) and not re.match(r"^\d", s):
        return 2
    
    # match 1. / 1.1 / 1.1.1 / 1.1.1.1
    match = re.match(r"^(\d+(?:\.\d+){0,3})\.?\s+", s)
    if match:
        depth = match.group(1).count(".")
        return 3 + depth  # 1. -> 3, 1.1 -> 4, 1.1.1 -> 5, 1.1.1.1 -> 6
    
    return None


def merge_multiline_headings(lines: list[str]) -> list[str]:
    """Merge các dòng heading bị gãy thành 1 dòng."""
    merged = []
    buffer = []
    
    def flush():
        if buffer:
            merged.append(" ".join(buffer))
            buffer.clear()
    
    for line in lines:
        s = line.strip()
        if not s:
            flush()
            merged.append("")
            continue
        
        if is_all_caps_vn(s):
            buffer.append(s)
        else:
            flush()
            merged.append(s)
    
    flush()
    return merged


def _lines_to_markdown_enhanced(text: str) -> str:
    """
    Chuyển plain text nội dung sách → Markdown với heading detection:
      CHƯƠNG/BÀI/PHẦN ...  → # heading
      1. / 1.1 / 1.1.1 ... → ## / ### / #### heading
      ALL-CAPS short line   → ## heading
      còn lại               → paragraph
    """
    lines = text.splitlines()
    lines = merge_multiline_headings(lines)
    
    md_lines = []
    for line in lines:
        s = line.strip()
        if not s:
            md_lines.append("")
            continue
        
        level = get_heading_level(s)
        if level:
            md_lines.append(f"\n{'#' * level} {s}")
        else:
            md_lines.append(s)
    
    return "\n".join(md_lines)


# ─────────────────────────────────────────
# PDF PROCESSING
# ─────────────────────────────────────────
def _find_section_boundaries(pages: list[str]) -> dict:
    """
    Quét toàn bộ trang để tìm vị trí bắt đầu mỗi phần.
    Trả về: {toc_start, abbrev_start, content_start} (None nếu không tìm thấy)
    """
    toc_start = abbrev_start = content_start = None

    for i, text in enumerate(pages):
        if toc_start is None and _RE_TOC.search(text):
            toc_start = i
        if abbrev_start is None and _RE_ABBREV.search(text):
            abbrev_start = i
        # Nội dung bắt đầu ở trang đầu tiên có heading chương (sau trang 0)
        if content_start is None and i > 0 and _RE_CHAPTER.search(text):
            content_start = i

    return {
        "toc_start":     toc_start,
        "abbrev_start":  abbrev_start,
        "content_start": content_start,
    }


def extract_pdf_sections(pdf_path: Path) -> dict:
    """
    Phân tích PDF → dict {cover, toc, abbrev, content}.
    Mỗi giá trị là chuỗi text đã ghép từ các trang thuộc phần đó.
    """
    try:
        import pdfplumber
    except ImportError:
        raise ImportError("Thiếu thư viện: pip install pdfplumber")

    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        print(f"  Tổng số trang: {len(pdf.pages)}")
        for page in pdf.pages:
            pages.append(clean_text(page.extract_text() or ""))

    bounds = _find_section_boundaries(pages)
    toc_s    = bounds["toc_start"]
    abbrev_s = bounds["abbrev_start"]
    content_s = bounds["content_start"]

    print(f"  Bìa:           trang 1 → {(toc_s or abbrev_s or content_s or 1)}")
    print(f"  Mục lục:       trang {toc_s}")
    print(f"  Chữ viết tắt:  trang {abbrev_s}")
    print(f"  Nội dung:      trang {content_s}")

    sections: dict[str, list[str]] = {"cover": [], "toc": [], "abbrev": [], "content": []}

    for i, text in enumerate(pages):
        if content_s is not None and i >= content_s:
            sections["content"].append(text)
        elif abbrev_s is not None and i >= abbrev_s:
            sections["abbrev"].append(text)
        elif toc_s is not None and i >= toc_s:
            sections["toc"].append(text)
        else:
            sections["cover"].append(text)

    return {k: "\n\n".join(v) for k, v in sections.items()}


def _lines_to_markdown(text: str) -> str:
    """
    Chuyển plain text nội dung sách → Markdown:
      CHƯƠNG/BÀI/PHẦN ...  → ## heading
      1.1 / 1.1.1 ...      → ### heading
      ALL-CAPS short line   → ### heading
      còn lại               → paragraph
    """
    md_lines = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            md_lines.append("")
            continue
        if _RE_CHAPTER.match(s):
            md_lines.append(f"\n## {s}")
        elif _RE_SECTION_NUM.match(s):
            md_lines.append(f"\n### {s}")
        elif is_all_caps_vn(s):
            md_lines.append(f"\n### {s}")
        else:
            md_lines.append(s)
    return "\n".join(md_lines)


def process_pdf(pdf_path: Path, out_dir: Path) -> Path:
    print(f"\n[PDF] Đang xử lý: {pdf_path.name}")
    sections = extract_pdf_sections(pdf_path)

    out_path = out_dir / (pdf_path.stem + ".md")
    parts = [
        "---",
        f"source: {pdf_path.name}",
        "type: book",
        "lang: vi",
        "---",
        "",
    ]

    if sections["cover"]:
        parts += ["# BÌA", "", sections["cover"], ""]

    if sections["toc"]:
        parts += ["---", "", "# MỤC LỤC", "", sections["toc"], ""]

    if sections["abbrev"]:
        parts += ["---", "", "# DANH MỤC CHỮ VIẾT TẮT", "", sections["abbrev"], ""]

    if sections["content"]:
        parts += ["---", "", "# NỘI DUNG", "", _lines_to_markdown(sections["content"]), ""]

    out_path.write_text("\n".join(parts), encoding="utf-8")
    print(f"[PDF] ✅ Lưu: {out_path.relative_to(BASE_DIR)}")
    return out_path


# ─────────────────────────────────────────
# XLSX PROCESSING
# ─────────────────────────────────────────
def process_vinmec_xlsx(full_path: Path, chunked_path: Path, out_dir: Path, metadata_path: Path | None = None) -> int:
    """
    Kết hợp vinmec_full + vinmec_chunked → 1 file .md / bài viết.
    Nếu có metadata_path, merge metadata (category, stage, safety_level) vào frontmatter.

    Cột vinmec_full:    Từ khóa | Tiêu đề | Link | Nội dung
    Cột vinmec_chunked: Từ khóa | Tiêu đề | Mục  | Nội dung chunk | Link
    Metadata:           title | category | stage | safety_level
    """
    print(f"\n[XLSX] Đang xử lý: {full_path.name} + {chunked_path.name}")

    df_full    = pd.read_excel(full_path)
    df_chunked = pd.read_excel(chunked_path)

    # Chuẩn hoá tên cột
    df_full.columns    = [c.strip() for c in df_full.columns]
    df_chunked.columns = [c.strip() for c in df_chunked.columns]

    # Load metadata nếu có
    metadata_map = {}
    if metadata_path and metadata_path.exists():
        import json
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata_list = json.load(f)
            metadata_map = {item["title"]: item for item in metadata_list}
        print(f"[XLSX] Loaded metadata: {len(metadata_map)} items")

    # Group chunked theo Tiêu đề để tra nhanh
    chunked_by_title = (
        df_chunked.groupby("Tiêu đề") if "Tiêu đề" in df_chunked.columns else {}
    )

    out_dir.mkdir(parents=True, exist_ok=True)
    saved = 0
    seen_slugs: dict[str, int] = {}   # để tránh ghi đè khi slug trùng

    for _, row in df_full.iterrows():
        title   = str(row.get("Tiêu đề", "")).strip()
        keyword = str(row.get("Từ khóa", "")).strip()
        link    = str(row.get("Link", "")).strip()
        content = str(row.get("Nội dung", "")).strip()

        if not title or title == "nan":
            continue

        # Xử lý slug trùng
        base_slug = slugify(title)
        if base_slug in seen_slugs:
            seen_slugs[base_slug] += 1
            slug = f"{base_slug}-{seen_slugs[base_slug]}"
        else:
            seen_slugs[base_slug] = 0
            slug = base_slug

        out_path = out_dir / f"{slug}.md"

        # Frontmatter
        md_lines = [
            "---",
            f"title: \"{title}\"",
            f"keyword: {keyword}",
            "source: vinmec",
            f"url: {link}",
        ]

        # Thêm metadata nếu có
        if title in metadata_map:
            meta = metadata_map[title]
            if "category" in meta:
                md_lines.append(f"category: {meta['category']}")
            if "stage" in meta:
                stages = ", ".join(meta["stage"]) if isinstance(meta["stage"], list) else meta["stage"]
                md_lines.append(f"stage: [{stages}]")
            if "safety_level" in meta:
                md_lines.append(f"safety_level: {meta['safety_level']}")

        md_lines += ["---", "", f"# {title}", ""]

        # Ưu tiên dùng chunked (có cấu trúc heading)
        if isinstance(chunked_by_title, dict) is False and title in chunked_by_title.groups:
            chunks = chunked_by_title.get_group(title)
            for _, ch in chunks.iterrows():
                section      = str(ch.get("Mục", "")).strip()
                chunk_content = clean_text(str(ch.get("Nội dung chunk", "")).strip())
                if section and section != "nan":
                    md_lines += [f"## {section}", ""]
                if chunk_content and chunk_content != "nan":
                    md_lines += [chunk_content, ""]
        else:
            # Fallback: dùng full content
            cleaned = clean_text(content)
            if cleaned and cleaned != "nan":
                md_lines += [cleaned, ""]

        out_path.write_text("\n".join(md_lines), encoding="utf-8")
        saved += 1

    print(f"[XLSX] ✅ Đã lưu {saved} file .md → {out_dir.relative_to(BASE_DIR)}")
    return saved


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
def run_all():
    print("=" * 55)
    print("  Bắt đầu xử lý dữ liệu thô → Markdown")
    print("=" * 55)

    PROC_DIR.mkdir(parents=True, exist_ok=True)
    health_care_dir = PROC_DIR / "health_care"
    health_care_dir.mkdir(parents=True, exist_ok=True)

    if PDF_PATH.exists():
        process_pdf(PDF_PATH, health_care_dir)
    else:
        print(f"[PDF] ⚠️  Không tìm thấy: {PDF_PATH}")

    # Path tới metadata
    metadata_path = BASE_DIR / "data" / "processed" / "metadata" / "vinmec.json"

    if XLSX_FULL_PATH.exists() and XLSX_CHUNKED_PATH.exists():
        process_vinmec_xlsx(
            XLSX_FULL_PATH,
            XLSX_CHUNKED_PATH,
            PROC_DIR / "vinmec",
            metadata_path=metadata_path if metadata_path.exists() else None
        )
    else:
        print(f"[XLSX] ⚠️  Không tìm thấy file xlsx tại {XLSX_FULL_PATH.parent}")

    print("\n✅  Hoàn thành!")


if __name__ == "__main__":
    run_all()
