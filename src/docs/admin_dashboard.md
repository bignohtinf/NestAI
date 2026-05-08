graph TD
    Root[Admin Dashboard] --> Overview[1. Tổng quan]
    Root --> Users[2. Quản lý người dùng]
    Root --> Nutrition[3. Dinh dưỡng & Hoạt động]
    Root --> Stores[4. Cửa hàng & Đối tác]
    Root --> AIHub[5. Trung tâm AI - Quản trị thuật toán]
    Root --> System[6. Hệ thống]

    %% Section 1: Overview
    Overview --> Dash[Bảng điều khiển - Dashboard]
    Overview --> Stat[Thống kê Analytics]
    Stat --> StatUser[Thống kê người dùng]
    Stat --> StatChat[Thống kê hội thoại AI]
    Stat --> StatHealth[Chỉ số sức khỏe cộng đồng]

    %% Section 2: Users
    Users --> UserList[Danh sách người dùng]
    Users --> MedProfile[Hồ sơ y tế & Thai kỳ]

    %% Section 3: Nutrition (Focus on Logs & Data)
    Nutrition --> AILogs[Nhật ký hoạt động AI]
    AILogs --> ChatLogs[Lịch sử Chat Nori]
    AILogs --> ScanLogs[Lịch sử Scan món ăn]
    AILogs --> RecLogs[Lịch sử Gợi ý thực đơn]
    Nutrition --> FoodDB[Quản lý thực phẩm]
    FoodDB --> Dishes[Danh mục món ăn & Dinh dưỡng]
    FoodDB --> Ingredients[Nguyên liệu gốc]

    %% Section 4: Stores (Tính năng mới thực tiễn)
    Stores --> StoreList[Danh sách cửa hàng/Siêu thị]
    Stores --> Mapping[Liên kết Món ăn - Cửa hàng]
    Stores --> Locations[Quản lý vị trí & Bản đồ]

    %% Section 5: AI Hub (Focus on Logic & Engine)
    AIHub --> Algo[Cấu hình thuật toán]
    Algo --> RecAlgo[Thuật toán gợi ý thực đơn]
    Algo --> ScanAlgo[Thuật toán nhận diện thực phẩm]
    AIHub --> RAG[Quản lý tri thức RAG - Docs]
    AIHub --> Monitor[Giám sát Token & Model]

    %% Section 6: System & Content (Gộp lại cho gọn)
    System --> CMS[Bài viết & Thông báo]
    System --> Settings[Cài đặt & Bảo mật]
