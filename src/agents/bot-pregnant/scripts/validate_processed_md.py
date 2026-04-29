from __future__ import annotations

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_TARGET_DIR = BASE_DIR / "data" / "processed" / "vinmec"
REQUIRED_KEYS = ("title", "source", "url")


def validate_frontmatter_position(raw_text: str) -> str | None:
    stripped = raw_text.lstrip()
    if stripped.startswith("---") and not raw_text.startswith("---"):
        return "Frontmatter không nằm ở đầu file."
    if not raw_text.startswith("---"):
        return "Thiếu frontmatter mở đầu '---'."
    return None


def safe_console(text: str) -> str:
    return text.encode("unicode_escape").decode("ascii")


def validate_markdown_file(path: Path) -> list[str]:
    errors: list[str] = []
    raw_text = path.read_text(encoding="utf-8")

    position_error = validate_frontmatter_position(raw_text)
    if position_error:
        errors.append(position_error)
        return errors

    parsed = parse_frontmatter(raw_text)
    if parsed is None:
        errors.append("Không parse được frontmatter.")
        return errors
    metadata, content = parsed
    if not metadata:
        errors.append("Metadata rỗng hoặc không hợp lệ.")
        return errors

    for key in REQUIRED_KEYS:
        value = metadata.get(key)
        if not isinstance(value, str) or not value.strip():
            errors.append(f"Thiếu metadata bắt buộc: '{key}'.")

    if not content.strip():
        errors.append("Nội dung sau frontmatter đang rỗng.")

    return errors


def parse_frontmatter(raw_text: str) -> tuple[dict[str, str], str] | None:
    lines = raw_text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None

    closing_idx = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            closing_idx = idx
            break
    if closing_idx is None:
        return None

    metadata_lines = lines[1:closing_idx]
    content = "\n".join(lines[closing_idx + 1 :])
    metadata: dict[str, str] = {}

    for line in metadata_lines:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            metadata[key] = value

    return metadata, content


def run(target_dir: Path = DEFAULT_TARGET_DIR) -> int:
    if not target_dir.exists():
        print(f"[ERROR] Không tìm thấy thư mục: {target_dir}")
        return 2

    md_files = sorted(target_dir.glob("*.md"))
    if not md_files:
        print(f"[WARN] Không có file .md trong: {target_dir}")
        return 0

    invalid_files: list[tuple[Path, list[str]]] = []
    for md_file in md_files:
        errs = validate_markdown_file(md_file)
        if errs:
            invalid_files.append((md_file, errs))

    total = len(md_files)
    bad = len(invalid_files)
    good = total - bad

    print(f"Scanned: {total} files")
    print(f"Valid:   {good}")
    print(f"Invalid: {bad}")

    if invalid_files:
        print("\nInvalid files:")
        for file_path, errs in invalid_files:
            print(f"- {safe_console(file_path.name)}")
            for err in errs:
                print(f"  + {safe_console(err)}")
        return 1

    print("\nAll files are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
