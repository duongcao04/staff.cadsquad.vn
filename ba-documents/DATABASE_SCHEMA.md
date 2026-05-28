# TÀI LIỆU CẤU TRÚC DỮ LIỆU (DATABASE SCHEMA)

**Dự án:** Cadsquad Staff  
**Ngày cập nhật:** 28/05/2026  
**Trạng thái:** Bản nháp (Draft)

---

## 1. Tổng quan Database
Hệ thống sử dụng **PostgreSQL** làm cơ sở dữ liệu chính, giao tiếp thông qua **Prisma ORM**. Cơ sở dữ liệu được thiết kế tập trung vào tính toàn vẹn (Referential Integrity), hỗ trợ truy vấn phân quyền phức tạp (RBAC) và theo dõi trạng thái công việc chi tiết.

---

## 2. Các thực thể chính (Core Entities)

### 2.1. Quản trị Người dùng & Phân quyền (Users & RBAC)
- **User:** Lưu thông tin cá nhân, chức danh (JobTitle), phòng ban (Department), người quản lý (Manager - cấu trúc hình cây). Liên kết với bảng MFA để bảo mật.
- **Role:** Định nghĩa các vai trò trong hệ thống (VD: Admin, Staff, Accounting).
- **Permission & PermissionGroup:** Các quyền thao tác (Create, Read, Update, Delete) trên từng thực thể (EntityEnum).
- **UserPermission:** Cho phép "Ghi đè" quyền của một User cụ thể (Cấp thêm quyền hoặc Từ chối quyền) thay vì chỉ dựa vào Role. Hỗ trợ giới hạn phạm vi truy cập (Scope: OWN, DEPARTMENT, ALL).
- **Session, Account, Verification:** Các bảng hỗ trợ đăng nhập và xác thực của Better Auth và Azure AD.

### 2.2. Quản lý Công việc & Dự án (Jobs & Operations)
- **Job:** Thực thể cốt lõi lưu thông tin một công việc/dự án (Mã Job, Khách hàng, Chi phí, Doanh thu, Trạng thái, Ưu tiên).
- **JobAssignment:** Bảng trung gian phân công Nhân viên (User) vào Công việc (Job) kèm theo chi phí nhân sự (Staff Cost).
- **JobStatus & JobStatusHistory:** Quản lý trạng thái công việc (To do, In Progress, Wait Review, Completed). Lưu lịch sử (History) ai đã chuyển trạng thái, chuyển khi nào và thời gian lưu tại trạng thái đó.
- **JobType & JobPriority:** Phân loại công việc và mức độ ưu tiên.
- **JobDelivery & JobDeliverFile:** Luồng nộp file/kết quả công việc (Delivery). Có các trạng thái Pending, Approved, Rejected kèm phản hồi từ Admin.
- **JobActivityLog:** Lưu lịch sử các thay đổi dữ liệu của Job (Audit Log) theo mức độ công khai hoặc bảo mật nội bộ.
- **JobComment:** Tính năng thảo luận, bình luận trong từng Job (Hỗ trợ Reply phân cấp).
- **PinnedJob:** Danh sách các công việc mà user đã "ghim" để theo dõi.

### 2.3. Khách hàng & Tài chính (Clients & Financials)
- **Client:** Lưu trữ thông tin Khách hàng (Cá nhân/Doanh nghiệp), thông tin liên hệ, thuế, chu kỳ thanh toán.
- **PaymentChannel:** Kênh thanh toán (Bank, E-Wallet, Crypto), phí giao dịch, tổng khối lượng giao dịch.
- **Transaction:** Giao dịch tài chính (Thu, Chi) liên kết với Job, Client và PaymentChannel (được định nghĩa thêm trong `transaction.prisma`).

### 2.4. Quản lý Tài nguyên & Tích hợp (Assets & Integrations)
- **FileSystem:** Cấu trúc quản lý file nội bộ, lưu trữ đường dẫn, dung lượng, màu sắc, và liên kết với Job/User.
- **JobFolderTemplate:** Mẫu cấu trúc thư mục Sharepoint khởi tạo sẵn cho các loại dự án.
- **SharepointItem (Referenced):** Liên kết với dữ liệu trên Microsoft Sharepoint.

### 2.5. Thông báo & Cộng đồng (Notifications & Social)
- **Notification:** Thông báo hệ thống cho User. Có nhiều loại (Job Update, System Alert, v.v.) và trạng thái (Seen/Unseen).
- **Community:** Các nhóm trao đổi nội bộ.
- **Gallery:** Lưu trữ thư viện hình ảnh/media cá nhân hoặc cộng đồng.
- **UserDevices & BrowserSubscribes:** Lưu trữ thiết bị người dùng và Push Subscription cho Web Push Notifications.

---

## 3. Các ràng buộc nghiệp vụ quan trọng (Business Constraints)

1. **Phân quyền linh hoạt:** Việc kiểm tra quyền truy cập cần kết hợp giữa `Role` của người dùng và `UserPermission` (có thể bị chặn quyền thông qua `isDenied = true`).
2. **Theo dõi trạng thái (Status Tracking):** Bất kỳ lúc nào `JobStatus` thay đổi, hệ thống sẽ tự động đóng bản ghi `JobStatusHistory` cũ (`endedAt`) và tạo bản ghi mới để đo lường hiệu suất xử lý (SLA).
3. **MFA (Xác thực 2 yếu tố):** Quản lý ở cấp độ User (`isTwoFactorAuthenticationEnabled`), yêu cầu kiểm tra khi đăng nhập từ thiết bị lạ (`UserDevices`).
4. **Log dữ liệu:** Mọi hành động nhạy cảm trong hệ thống như duyệt Job, đổi thông tin tài chính đều phải được ghi lại ở `JobActivityLog` hoặc `SystemAuditLog`.
