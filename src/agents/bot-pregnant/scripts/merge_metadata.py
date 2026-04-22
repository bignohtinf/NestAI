#!/usr/bin/env python3
"""
Merge fix_state.json vào vinmec.json theo title
- Lấy stage từ fix_state
- Xóa stage cũ trong vinmec
- Giữ nguyên các trường khác
"""
import json
from pathlib import Path

# Paths
metadata_dir = Path(__file__).parent.parent / "data" / "processed" / "metadata"
fix_state_file = metadata_dir / "fix_state.json"
vinmec_file = metadata_dir / "vinmec.json"

# Load files
with open(fix_state_file, "r", encoding="utf-8") as f:
    fix_state = json.load(f)

with open(vinmec_file, "r", encoding="utf-8") as f:
    vinmec = json.load(f)

# Create lookup map từ fix_state
fix_state_map = {item["title"]: item["stage"] for item in fix_state}

# Merge
updated_count = 0
for item in vinmec:
    title = item["title"]
    if title in fix_state_map:
        item["stage"] = fix_state_map[title]
        updated_count += 1

# Save
with open(vinmec_file, "w", encoding="utf-8") as f:
    json.dump(vinmec, f, ensure_ascii=False, indent=4)

print(f"✅ Cập nhật {updated_count}/{len(vinmec)} items")
print(f"📁 Lưu vào: {vinmec_file}")
