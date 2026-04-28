import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
TARGET_DIR = BASE_DIR / "data" / "processed" / "vinmec_tmp"

def normalize_text(text):
    # thêm xuống dòng trước Hỏi / Trả lời nếu bị dính
    text = re.sub(r'(Hỏi)', r'\n\1\n', text)
    text = re.sub(r'(Trả lời)', r'\n\1\n', text)
    
    return text

def split_qa(content):
    content = normalize_text(content)

    parts = re.split(r'\bTrả lời\b', content, maxsplit=1)

    if len(parts) < 2:
        return None

    question_part = parts[0]
    answer_part = parts[1]

    # bỏ chữ "Hỏi"
    question_part = re.sub(r'\bHỏi\b', '', question_part).strip()

    return question_part, answer_part.strip()

def format_md(content):
    qa = split_qa(content)
    
    if not qa:
        return content

    q, a = qa

    return f"""## Hỏi

{q}

## Trả lời

{a}
"""


def process_file(file_path: Path) -> bool:
    original = file_path.read_text(encoding="utf-8")
    formatted = format_md(original)

    if formatted == original:
        return False

    file_path.write_text(formatted, encoding="utf-8")
    return True


def safe_name_for_console(path: Path) -> str:
    return path.name.encode("unicode_escape").decode("ascii")


def main():
    if not TARGET_DIR.exists():
        raise FileNotFoundError(f"Không tìm thấy thư mục: {TARGET_DIR}")

    updated_count = 0
    total_count = 0

    for md_file in sorted(TARGET_DIR.glob("*.md")):
        total_count += 1
        if process_file(md_file):
            updated_count += 1
            print(f"Updated: {safe_name_for_console(md_file)}")

    print(f"Done. Updated {updated_count}/{total_count} files in {TARGET_DIR}")


if __name__ == "__main__":
    main()