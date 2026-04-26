"""
Filter profiles.json to keep only relevant profiles for NestAI:
  1. Children under 5 years old (all genders)
  2. Pregnant mothers (age >= 15)
  3. Breastfeeding mothers (age >= 15)

Also removes corresponding recommendation CSV files for filtered-out profiles.
"""

import json
import os
import shutil
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parents[1]
PROFILES_JSON = BASE_DIR / "data" / "raw" / "profiles" / "profiles.json"
RECOMMENDATIONS_DIR = BASE_DIR / "data" / "raw" / "profiles" / "recommendations"
BACKUP_JSON = BASE_DIR / "data" / "raw" / "profiles" / "profiles_full_backup.json"

# ---------------------------------------------------------------------------
# Filter Logic
# ---------------------------------------------------------------------------

# Age groups for children under 5
CHILD_AGE_GROUPS = {
    "0-5 tháng",
    "6-8 tháng",
    "9-11 tháng",
    "1-2 tuổi",
    "3-5 tuổi",
}

# Age groups where pregnancy/breastfeeding is biologically valid (>= 15)
VALID_MATERNAL_AGE_GROUPS = {
    "15-17 tuổi",
    "18-29 tuổi",
    "30-49 tuổi",
    "50-69 tuổi",
    ">= 70 tuổi",
    "≥ 70 tuổi",
}

MATERNAL_CONDITIONS = {
    "Phụ nữ có thai 3 tháng đầu",
    "Phụ nữ có thai 3 tháng giữa",
    "Phụ nữ có thai 3 tháng cuối",
    "Bà mẹ đang cho con bú",
}


def should_keep(profile: dict) -> bool:
    """Determine if a profile should be kept."""
    p = profile["profile"]
    age = p.get("Nhóm tuổi/Age group", "")
    gender = p.get("Giới tính/Gender", "")
    condition = p.get("Tình trạng sinh lý/Physiological condition", "")

    # Rule 1: Keep all children under 5 (no pregnancy condition)
    if age in CHILD_AGE_GROUPS:
        return True

    # Rule 2: Keep pregnant/breastfeeding mothers at valid ages
    if gender == "Nữ" and condition in MATERNAL_CONDITIONS:
        if age in VALID_MATERNAL_AGE_GROUPS:
            return True

    # Rule 3: Discard everything else
    return False


def main():
    # Load profiles
    with open(PROFILES_JSON, "r", encoding="utf-8") as f:
        all_profiles = json.load(f)

    print(f"Total profiles BEFORE filter: {len(all_profiles)}")

    # Backup original
    shutil.copy2(PROFILES_JSON, BACKUP_JSON)
    print(f"Backup saved to: {BACKUP_JSON}")

    # Filter
    kept = []
    removed = []
    for p in all_profiles:
        if should_keep(p):
            kept.append(p)
        else:
            removed.append(p)

    # Re-number STTs (1-based)
    old_to_new = {}
    for i, p in enumerate(kept, start=1):
        old_stt = p["stt"]
        old_to_new[old_stt] = i
        p["stt"] = i

    print(f"\nTotal profiles AFTER filter: {len(kept)}")
    print(f"Removed: {len(removed)}")

    # Show what we're keeping
    print("\n--- KEPT profiles ---")
    for p in kept:
        prof = p["profile"]
        age = prof.get("Nhóm tuổi/Age group", "")
        gender = prof.get("Giới tính/Gender", "")
        condition = prof.get("Tình trạng sinh lý/Physiological condition", "")
        labor = prof.get("Mức độ lao động/Labor Level", "")
        print(f"  STT {p['stt']:3d} | {age:15s} | {gender:4s} | {labor:12s} | {condition}")

    print("\n--- REMOVED profiles (sample) ---")
    for p in removed[:10]:
        prof = p["profile"]
        age = prof.get("Nhóm tuổi/Age group", "")
        gender = prof.get("Giới tính/Gender", "")
        condition = prof.get("Tình trạng sinh lý/Physiological condition", "")
        print(f"  OLD STT {p['stt']:3d} | {age:15s} | {gender:4s} | {condition}")
    if len(removed) > 10:
        print(f"  ... and {len(removed) - 10} more")

    # Rename recommendation CSV files
    print("\n--- Renaming recommendation CSVs ---")
    for old_stt, new_stt in old_to_new.items():
        old_csv = RECOMMENDATIONS_DIR / f"{old_stt}.csv"
        new_csv = RECOMMENDATIONS_DIR / f"new_{new_stt}.csv"
        if old_csv.exists():
            shutil.copy2(old_csv, new_csv)

    # Remove ALL old CSVs
    for f in RECOMMENDATIONS_DIR.glob("*.csv"):
        if not f.name.startswith("new_"):
            f.unlink()

    # Rename new_ to final
    for f in RECOMMENDATIONS_DIR.glob("new_*.csv"):
        final_name = f.name.replace("new_", "")
        f.rename(RECOMMENDATIONS_DIR / final_name)

    # Save filtered profiles.json
    with open(PROFILES_JSON, "w", encoding="utf-8") as f:
        json.dump(kept, f, ensure_ascii=False, indent=4)

    print(f"\n✅ Done! Filtered profiles saved to {PROFILES_JSON}")
    print(f"   Backup of original: {BACKUP_JSON}")


if __name__ == "__main__":
    main()
