#!/usr/bin/env python3
"""
Script để xóa các nutrition profiles không cần thiết:
1. Xóa các độ tuổi từ 6 đến 14
2. Xóa các độ tuổi từ 15+ nhưng chỉ xóa những dòng có tình trạng "không có thai"
"""

import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.core.supabase_client import get_supabase_admin
from app.core.config import settings

def get_age_from_string(age_group: str) -> int:
    """
    Trích xuất độ tuổi từ chuỗi age_group
    Ví dụ: "18-25 tuổi" -> 18, "6-8 tuổi" -> 6, "15-18 tuổi" -> 15
    """
    if not age_group:
        return -1

    # Lấy số đầu tiên
    age_str = ""
    for char in age_group:
        if char.isdigit():
            age_str += char
        elif age_str:
            break

    try:
        return int(age_str) if age_str else -1
    except ValueError:
        return -1

def should_delete_profile(age_group: str, physiological_condition: str) -> tuple[bool, str]:
    """
    Xác định xem có nên xóa profile này không
    Returns: (should_delete, reason)
    """
    if not age_group:
        return False, "age_group trống"

    age = get_age_from_string(age_group)

    # Điều kiện 1: Xóa các độ tuổi từ 6 đến 14
    if 6 <= age <= 14:
        return True, f"Độ tuổi {age} nằm trong khoảng 6-14"

    # Điều kiện 2: Xóa các độ tuổi từ 15+ nhưng chỉ xóa nếu tình trạng là "không có thai"
    if age >= 15:
        if physiological_condition and "không có thai" in physiological_condition.lower():
            return True, f"Độ tuổi {age} với tình trạng 'không có thai'"
    if age >= 55:
        return True, f"Độ tuổi {age} lớn hơn 55"

    return False, "Không cần xóa"

def cleanup_nutrition_profiles():
    """Xóa các nutrition profiles theo điều kiện"""

    print("=" * 70)
    print("CLEANUP NUTRITION PROFILES SCRIPT")
    print("=" * 70)
    print()

    try:
        # Kết nối Supabase
        supabase = get_supabase_admin()
        print("✓ Kết nối Supabase thành công")
        print()

        # Lấy tất cả profiles
        print("Đang tải danh sách profiles...")
        result = supabase.table("nutrition_profiles").select("*").execute()
        profiles = result.data or []

        print(f"Tổng profiles: {len(profiles)}")
        print()

        # Phân loại profiles cần xóa
        to_delete = []
        to_keep = []

        print("Phân tích profiles:")
        print("-" * 70)

        for profile in profiles:
            stt = profile.get("stt")
            age_group = profile.get("age_group")
            physiological_condition = profile.get("physiological_condition", "")

            should_delete, reason = should_delete_profile(age_group, physiological_condition)

            if should_delete:
                to_delete.append((stt, age_group, physiological_condition, reason))
                status = "❌ XÓA"
            else:
                to_keep.append((stt, age_group, physiological_condition))
                status = "✓ GIỮ"

            print(f"{status} | STT: {stt:3d} | Độ tuổi: {age_group:15s} | Tình trạng: {physiological_condition:20s} | {reason}")

        print()
        print("=" * 70)
        print(f"Tổng cần GIỮ: {len(to_keep)}")
        print(f"Tổng cần XÓA: {len(to_delete)}")
        print("=" * 70)
        print()

        if not to_delete:
            print("Không có profile nào cần xóa!")
            return

        # Hiển thị chi tiết cần xóa
        print("Chi tiết các profiles cần xóa:")
        print("-" * 70)
        for stt, age_group, phys_cond, reason in to_delete:
            print(f"  STT {stt}: {age_group} ({phys_cond}) - {reason}")
        print()

        # Xác nhận trước khi xóa
        print("⚠️  CẢNH BÁO: Bạn sắp xóa {} profiles!".format(len(to_delete)))
        print("Hành động này KHÔNG thể hoàn tác!")
        print()

        confirm = input("Bạn có chắc chắn muốn tiếp tục? (yes/no): ").strip().lower()

        if confirm != "yes":
            print("❌ Đã hủy bỏ thao tác.")
            return

        print()
        print("Đang xóa...")
        deleted_count = 0
        failed_count = 0

        for stt, age_group, phys_cond, reason in to_delete:
            try:
                # Xóa recommendations liên kết trước
                supabase.table("nutrition_recommendations").delete().eq("profile_stt", stt).execute()

                # Xóa profile
                supabase.table("nutrition_profiles").delete().eq("stt", stt).execute()

                print(f"  ✓ Đã xóa STT {stt}")
                deleted_count += 1
            except Exception as e:
                print(f"  ❌ Lỗi xóa STT {stt}: {str(e)}")
                failed_count += 1

        print()
        print("=" * 70)
        print(f"✓ Thành công: {deleted_count} profiles")
        if failed_count > 0:
            print(f"❌ Thất bại: {failed_count} profiles")
        print("=" * 70)

        # Lấy danh sách mới để xác nhận
        print()
        print("Xác nhận danh sách còn lại:")
        result = supabase.table("nutrition_profiles").select("*").order("stt").execute()
        remaining = result.data or []
        print(f"Tổng profiles còn lại: {len(remaining)}")

        for profile in remaining:
            stt = profile.get("stt")
            age_group = profile.get("age_group")
            phys_cond = profile.get("physiological_condition", "")
            print(f"  STT {stt}: {age_group} - {phys_cond}")

        print()
        print("✓ Quá trình hoàn tất!")

    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    cleanup_nutrition_profiles()
