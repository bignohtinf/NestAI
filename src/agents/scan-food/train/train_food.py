import os

from ultralytics import YOLO

# 1. Cấu hình đường dẫn
ROOT_DIR = r"D:\Vin\projects\A20-App-005\src\agents\scan-food"
MODEL_PATH = os.path.join(ROOT_DIR, "checkpoints", "yolov8s.pt")
DATA_DIR = os.path.join(ROOT_DIR, "data", "recipes", "drop_images")

# 2. Tạo file data.yaml (YOLOv8 cần file này để biết đường dẫn tập train/val)
# Lưu ý: Bạn cần chia dữ liệu trong drop_images thành 2 thư mục 'train' và 'val' 
# Mỗi thư mục gồm có ảnh (.jpg) và nhãn tương ứng (.txt) theo format YOLO
yaml_content = f"""
path: {DATA_DIR} # đường dẫn gốc tới dataset
train: images/train  # đường dẫn tương đối tới ảnh train
val: images/val      # đường dẫn tương đối tới ảnh val

# Danh sách các class (Thay đổi đúng theo các món ăn bạn đã gán nhãn)
names:
  0: Pho
  1: Bun-bo-Hue
  2: Banh-mi
  # ... thêm tiếp các món khác của Viện Dinh Dưỡng vào đây
"""

yaml_path = os.path.join(ROOT_DIR, "food_data.yaml")
with open(yaml_path, "w", encoding="utf-8") as f:
    f.write(yaml_content)

# 3. Khởi tạo model từ checkpoint có sẵn
model = YOLO(MODEL_PATH)

# 4. Bắt đầu Fine-tune
results = model.train(
    data=yaml_path,      # file cấu hình dữ liệu
    epochs=100,          # số vòng lặp (tùy chỉnh theo độ hội tụ)
    imgsz=640,           # kích thước ảnh đầu vào
    batch=16,            # số lượng ảnh mỗi batch (giảm xuống nếu thiếu VRAM)
    device=0,            # sử dụng GPU (0) hoặc 'cpu'
    project=os.path.join(ROOT_DIR, "runs"), # nơi lưu kết quả train
    name="food_finetune",
    pretrained=True,     # sử dụng trọng số có sẵn
    optimizer='SGD',     # hoặc 'AdamW'
    lr0=0.01,            # learning rate khởi đầu
)

print("Fine-tune hoàn tất! Model tốt nhất được lưu tại:", results.save_dir)
