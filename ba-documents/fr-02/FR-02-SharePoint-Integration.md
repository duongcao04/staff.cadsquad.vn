# TÀI LIỆU KỸ THUẬT: FR-02 - Quản lý Tài liệu & Tích hợp (SharePoint Integration)

**Module:** Quản lý Tài liệu & Tích hợp SharePoint  
**Mã YC:** FR-02  

---

## 1. Kiến trúc Tích hợp (Integration Architecture)

Hệ thống giao tiếp trực tiếp với Microsoft SharePoint thông qua **Microsoft Graph API**. Để tránh việc nghẽn luồng xử lý chính của NodeJS khi phải tương tác với các file dung lượng lớn (có thể lên tới hàng GB), hệ thống áp dụng kiến trúc Message Queue (Hàng đợi) kết hợp với Cơ chế tải lên phân mảnh (Chunked Upload).

- **Thư viện chính:** `@azure/msal-node` (lấy Access Token qua Client Credentials flow) và `@microsoft/microsoft-graph-client` (thao tác thư mục/file).
- **Message Queue:** Sử dụng `BullMQ` (hàng đợi trên nền Redis) để đẩy các tác vụ nặng (Upload file, Tạo thư mục tự động, Copy thư mục) xuống chạy nền (Background processing).

---

## 2. Chi tiết Nghiệp vụ

### 2.1. Upload File dung lượng lớn (FR-02.1)
Thay vì đẩy toàn bộ file lên RAM (gây lỗi Out Of Memory), quá trình upload diễn ra như sau:
1. **Queue Upload:** File được lưu tạm vào thư mục `./working` trên server và đẩy thông tin vào BullMQ (`JOB_UPLOAD_FILE`).
2. **Khởi tạo Session:** Hệ thống gọi Graph API tạo một `UploadSession` trên SharePoint.
3. **Phân mảnh (Chunking):** File được chia nhỏ thành các đoạn có kích thước tối đa khoảng **3.2MB** (bắt buộc phải là bội số của 320 KiB theo chuẩn Microsoft).
4. **Đẩy tuần tự:** Vòng lặp `while` đẩy từng đoạn (chunk) qua phương thức PUT kèm header `Content-Range`.
5. **Dọn dẹp:** Sau khi thành công, trả về URL của file. Hệ thống Worker sẽ xóa file tạm trên server.

### 2.2. Khởi tạo Thư mục tự động & Sao chép (FR-02.2 & 02.3)
Khi một Job mới được tạo ra, hệ thống cần sinh cây thư mục lưu trữ tài liệu chuẩn hóa:
- **Copy Item:** Nếu Job yêu cầu sử dụng Template, hệ thống gọi Graph API Endpoint `/copy` để clone cấu trúc thư mục mẫu sang thư mục của Job mới. Nếu Microsoft trả về trạng thái `202 Accepted` (Copy bất đồng bộ), hệ thống sẽ Polling (hỏi liên tục) `monitorUrl` mỗi 2 giây cho đến khi hoàn tất (`status === 'completed'`).
- **Chia sẻ công khai (Anonymous Link):** Sau khi Copy xong thư mục, API tự động tạo link chia sẻ với cấu hình `type: 'edit'` và `scope: 'anonymous'`. Tính năng này cho phép Khách hàng không có tài khoản Microsoft cũng có quyền truy cập vào thư mục để tải/nhận file.

### 2.3. Duyệt & Xóa File (FR-02.3)
- Các API như `getItems` hỗ trợ liệt kê nội dung (`children`) của thư mục gốc hoặc thư mục chỉ định, đếm số file con, dung lượng và thông tin người tạo.
- API lấy `DownloadUrl` cho phép người dùng trực tiếp tải file mà không bị SharePoint chặn (trừ trường hợp nó là một Folder).

---

## 3. Thành phần mã nguồn liên quan
- **Service:** `server/src/modules/sharepoint/sharepoint.service.ts`
- **Queue/Processor:** `sharepoint.processor.ts` (BullMQ logic).
- **Constants:** `sharepoint.constants.ts` (Khai báo tên hàng đợi).
