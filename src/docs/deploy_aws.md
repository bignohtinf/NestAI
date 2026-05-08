# Hướng dẫn Deploy Dự án lên AWS

Tài liệu này cung cấp lộ trình chi tiết để đưa ứng dụng của bạn (Next.js Frontend & FastAPI Backend) lên AWS để có URL chính thức.

## 1. Cơ sở dữ liệu (Database)
Bạn đang có file `db_nextai.txt` chứa mã SQL export từ Supabase. Việc chuyển sang AWS RDS (Relational Database Service) là hoàn toàn khả thi nhưng cần lưu ý một số điểm:

### Khả năng tương thích
*   **Mã SQL**: Các lệnh `CREATE TABLE`, `uuid`, `jsonb`, `timestamp` trong file của bạn là chuẩn PostgreSQL. AWS RDS PostgreSQL hỗ trợ 100%.
*   **Sử dụng pgvector**: Trong file có cột `embedding USER-DEFINED`. Nếu bạn dùng tìm kiếm vector, bạn cần kích hoạt extension `pgvector` trên AWS RDS (AWS có hỗ trợ cái này).
*   **Vấn đề Schema `auth`**: Supabase sử dụng schema `auth` cho người dùng. Trong file SQL của bạn có đoạn `REFERENCES auth.users(id)`. Trên AWS RDS, bạn sẽ không có sẵn schema này.
    *   **Giải pháp**: Bạn nên tạo một bảng `users` nội bộ trong schema `public` và trỏ các khóa ngoại vào đó, hoặc thiết lập một hệ thống Auth như AWS Cognito/Auth0.

### Cách thực hiện
1.  Tạo một Instance **RDS PostgreSQL** trên AWS.
2.  Dùng một công cụ như pgAdmin hoặc DBeaver kết nối vào database mới.
3.  Chạy các lệnh `CREATE TYPE` (nếu có) trước, sau đó mới chạy mã SQL trong `db_nextai.txt`.

## 2. Cấu hình và Chi phí đề xuất

Với dự án hiện tại (đã có Dockerfile cho cả frontend và backend), cấu hình dưới đây là hợp lý nhất:

### Cấu hình đề xuất (Cân bằng Hiệu năng & Chi phí)

Dựa trên việc hệ thống của bạn có **RAG (Retrieval-Augmented Generation)**, **Chatbot**, và các **thuật toán tối ưu**, cấu hình tối thiểu (0.25 vCPU) sẽ không đủ để xử lý mượt mà.

#### 1. Mức Tiêu chuẩn (Khuyến nghị cho Production)
*   **Backend (FastAPI)**: **1 vCPU & 2 GB RAM** (AWS App Runner).
    *   *Lý do*: Các thư viện xử lý ngôn ngữ tự nhiên (NLP), xử lý Vector và thuật toán tối ưu trong Python khá tốn RAM. 2GB giúp tránh lỗi `Out of Memory` khi nhiều người dùng cùng lúc.
*   **Frontend (Next.js)**: **0.5 vCPU & 1 GB RAM** (AWS App Runner).
    *   *Lý do*: Next.js cần một lượng tài nguyên nhất định để Server-side Rendering (SSR).
*   **Database**: **db.t4g.small** (2 vCPU, 2 GB RAM).
    *   *Lý do*: Với nhiều bảng logs và tìm kiếm vector (pgvector), `micro` instance sẽ nhanh chóng bị nghẽn I/O. `small` cung cấp hiệu năng ổn định hơn nhiều.

#### 2. Mức Tối thiểu (Chỉ để Test/Demo)
*   **App Tier**: 0.25 vCPU & 0.5 GB RAM.
*   **Database**: db.t4g.micro.
*   *Lưu ý*: Cấu hình này sẽ rất chậm và dễ crash nếu chatbot xử lý văn bản dài.

### Chi phí dự tính (Mức Tiêu chuẩn)
*   **RDS (t4g.small)**: ~$30 - $35/tháng.
*   **App Runner (2 services)**: ~$30 - $50/tháng (tùy tải).
*   **Tổng cộng**: Khoảng **60$ - 85$ / tháng**.

---

## 4. Tại sao máy mạnh vẫn thấy "lag"?
Bạn có cấu hình máy rất mạnh (RTX 4060, Ryzen 7) nhưng Admin Dashboard vẫn lag, nguyên nhân thường không nằm ở CPU/RAM mà ở:
1.  **Database Query**: Các bảng Logs nếu không được **Đánh chỉ mục (Index)** đúng cách sẽ khiến việc truy vấn tốn hàng giây khi dữ liệu lớn dần.
2.  **Pagination (Phân trang)**: Nếu Admin load hàng ngàn dòng log cùng lúc về Frontend, trình duyệt sẽ bị treo (lag) khi render. Cần dùng *Infinite Scroll* hoặc *Pagination*.
3.  **Network Latency**: Nếu bạn đang dùng Supabase (Server ở Singapore/US) thì độ trễ mạng là nguyên nhân chính.
4.  **Heavy Components**: Các biểu đồ (Charts) hoặc 3D Carousel nếu render quá nhiều phần tử cùng lúc sẽ làm giảm FPS của trang web.

## 3. Quy trình Cập nhật Code (CI/CD)

Để cập nhật code tự động mỗi khi bạn `git push`, bạn nên sử dụng **GitHub Actions**.

### Luồng hoạt động:
1.  **Code Push**: Bạn push code lên GitHub.
2.  **GitHub Action**: Tự động kích hoạt một workflow:
    *   Build Docker image cho Frontend/Backend.
    *   Push Docker image lên **AWS ECR** (Elastic Container Registry).
3.  **Deployment**: AWS App Runner nhận thấy có image mới trên ECR và tự động cập nhật (Rolling Update) mà không làm gián đoạn dịch vụ.

### Các bước chuẩn bị:
1.  Tạo tài khoản AWS và thiết lập IAM User với quyền `AdministratorAccess` (hoặc quyền giới hạn cho App Runner/ECR).
2.  Tạo Repository trên AWS ECR cho frontend và backend.
3.  Cấu hình `secrets` trên GitHub (AWS_ACCESS_KEY, AWS_SECRET_KEY).
4.  Viết file `.github/workflows/deploy.yml`.

## Tóm tắt lời khuyên
*   **Database**: File SQL của bạn ổn, nhưng cần sửa các tham chiếu đến `auth.users` trước khi chạy trên AWS.
*   **Cấu hình**: Hãy bắt đầu với **App Runner** vì nó đơn giản nhất, không cần quản lý Server (EC2) phức tạp.
*   **Cập nhật**: Dùng **GitHub Actions** để tự động hóa hoàn toàn, bạn chỉ cần code và push, mọi thứ còn lại AWS sẽ lo.
