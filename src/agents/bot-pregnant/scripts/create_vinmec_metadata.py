import os
import yaml
import json

# load json data
with open("data/processed/metadata/vinmec.json", "r", encoding="utf-8") as f:
    json_data = json.load(f)

# convert json list -> dict theo title
json_map = {item["title"]: item for item in json_data}

def process_md(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # tách frontmatter
    parts = content.split("---")
    frontmatter = yaml.safe_load(parts[1])

    title = frontmatter.get("title")

    # tìm trong json
    extra = json_map.get(title, {})

    # merge dữ liệu
    frontmatter["category"] = extra.get("category", "Không rõ")
    frontmatter["stage"] = extra.get("stage", [])
    frontmatter["safety_level"] = extra.get("safety_level", "Không áp dụng")

    # rebuild md
    new_md = "---\n"
    new_md += yaml.dump(frontmatter, allow_unicode=True)
    new_md += "---\n"
    new_md += "---".join(parts[2:])

    return new_md


# chạy toàn bộ folder
input_folder = "data/processed/vinmec"
output_folder = "data/processed/vinmec_tmp"

os.makedirs(output_folder, exist_ok=True)

for file in os.listdir(input_folder):
    if file.endswith(".md"):
        new_content = process_md(os.path.join(input_folder, file))
        
        with open(os.path.join(output_folder, file), "w", encoding="utf-8") as f:
            f.write(new_content)