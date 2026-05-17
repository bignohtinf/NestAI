"""
cut_baby_journey.py
-------------------
Xử lý tất cả video trong thư mục baby-journey:
  1. Tắt âm thanh
  2. Cắt 2 bên (chia 6 phần ngang, giữ 4 phần giữa)
  3. Lấy 4s cuối (video gốc = 8s)
  4. Lưu vào baby-journey-cut/

Yêu cầu: ffmpeg + ffprobe đã được cài đặt và có trong PATH.
"""

import os
import subprocess
import sys
import json
from pathlib import Path

# ─── Cấu hình ────────────────────────────────────────────────────────────────
INPUT_DIR  = Path(r"D:\Vin\projects\A20-App-005\baby-journey")
OUTPUT_DIR = Path(r"D:\Vin\projects\A20-App-005\baby-journey-cut")
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

TOTAL_PARTS    = 6   # chia 6 phần ngang
KEEP_PARTS     = 4   # giữ 4 phần giữa
VIDEO_DURATION = 8   # tổng thời lượng video gốc (giây)
KEEP_DURATION  = 4   # lấy bao nhiêu giây cuối
# ─────────────────────────────────────────────────────────────────────────────


def get_video_size(path: Path) -> tuple[int, int]:
    """Dùng ffprobe để lấy width, height của video."""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_streams",
        str(path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    data = json.loads(result.stdout)
    video_stream = next(s for s in data["streams"] if s["codec_type"] == "video")
    return int(video_stream["width"]), int(video_stream["height"])


def compute_crop(width: int, height: int, total_parts: int, keep_parts: int) -> tuple[int, int, int]:
    """Trả về (crop_w, crop_h, crop_x) để giữ keep_parts phần giữa."""
    part_w   = width / total_parts
    side_cut = (total_parts - keep_parts) / 2  # số phần bỏ mỗi bên
    x        = round(part_w * side_cut)
    crop_w   = width - 2 * x
    return crop_w, height, x


def process_video(input_path: Path, output_path: Path) -> bool:
    """Tự detect kích thước rồi chạy ffmpeg để xử lý 1 video."""
    try:
        w, h = get_video_size(input_path)
    except Exception as e:
        print(f"  ✗ Không đọc được thông tin video: {e}", file=sys.stderr)
        return False

    crop_w, crop_h, crop_x = compute_crop(w, h, TOTAL_PARTS, KEEP_PARTS)
    start_sec = VIDEO_DURATION - KEEP_DURATION  # = 4.0

    cmd = [
        "ffmpeg",
        "-y",                          # ghi đè nếu file đã tồn tại
        "-ss", str(start_sec),         # bắt đầu từ giây start_sec
        "-i", str(input_path),
        "-t", str(KEEP_DURATION),      # lấy KEEP_DURATION giây
        "-an",                         # tắt âm thanh
        "-vf", f"crop={crop_w}:{crop_h}:{crop_x}:0",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ✗ LỖI ffmpeg: {result.stderr[-300:]}", file=sys.stderr)
        return False

    size_info = f"{crop_w}x{crop_h}, x={crop_x}"
    if w != 1280:
        size_info += f"  [gốc {w}x{h}]"
    print(f"✓  ({size_info})")
    return True


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    start_sec = VIDEO_DURATION - KEEP_DURATION

    print("=" * 65)
    print("  CUT BABY JOURNEY VIDEOS")
    print("=" * 65)
    print(f"  Input      : {INPUT_DIR}")
    print(f"  Output     : {OUTPUT_DIR}")
    print("  Crop       : bỏ 1/6 mỗi bên, giữ 4/6 giữa (tự detect size)")
    print(f"  Thời gian  : lấy {KEEP_DURATION}s cuối (từ t={start_sec}s)")
    print("=" * 65)

    videos = sorted([f for f in INPUT_DIR.iterdir() if f.suffix.lower() in VIDEO_EXTENSIONS])
    if not videos:
        print(f"Không tìm thấy video nào trong {INPUT_DIR}")
        return

    print(f"Tìm thấy {len(videos)} video.\n")

    success = 0
    for i, video in enumerate(videos, 1):
        out_file = OUTPUT_DIR / video.name
        print(f"[{i:02d}/{len(videos)}] {video.name} ... ", end="", flush=True)
        ok = process_video(video, out_file)
        if ok:
            success += 1

    print()
    print("=" * 65)
    print(f"  Hoàn thành : {success}/{len(videos)} video")
    print(f"  Lưu tại    : {OUTPUT_DIR}")
    print("=" * 65)


if __name__ == "__main__":
    main()
