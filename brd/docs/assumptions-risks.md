---
icon: lucide/triangle-alert
---

# Giả định, Ràng buộc, Rủi ro & Thuật ngữ

## 1. Giả định (Assumptions)

| ID | Giả định |
| --- | --- |
| AS-01 | Toàn bộ nhân sự có tài khoản Microsoft 365 của công ty để dùng SSO và SharePoint |
| AS-02 | Tài liệu sản phẩm bàn giao được lưu trên SharePoint, không lưu trực tiếp trong hệ thống |
| AS-03 | Chi phí nhân sự được thoả thuận theo từng job, không theo lương cố định |
| AS-04 | Việc thu tiền khách hàng và chuyển tiền cho nhân sự thực hiện ngoài hệ thống; hệ thống ghi nhận và đối soát |
| AS-05 | Người dùng nội bộ, hệ thống không mở ra Internet cho khách hàng |
| AS-06 | Quy tắc đánh mã job theo năm/loại được thống nhất và không đổi hồi tố |

## 2. Ràng buộc (Constraints)

| ID | Ràng buộc |
| --- | --- |
| CO-01 | Nền tảng công nghệ đã chốt: NestJS + PostgreSQL + Prisma (backend), React + TanStack Router (frontend), Tauri (desktop) |
| CO-02 | Hạ tầng triển khai bằng Docker Compose với giới hạn RAM cho từng container |
| CO-03 | Múi giờ vận hành `Asia/Ho_Chi_Minh`; tiền tệ mặc định giao dịch `VND`, khách hàng mặc định `USD` |
| CO-04 | Phụ thuộc hạn mức và chính sách API của Microsoft Graph, Ably, Firebase, Cloudinary |
| CO-05 | Giao diện hỗ trợ hai ngôn ngữ: English và Tiếng Việt |

## 3. Phụ thuộc (Dependencies)

| ID | Phụ thuộc |
| --- | --- |
| DE-01 | Cấp quyền ứng dụng trên Microsoft Entra ID và site SharePoint |
| DE-02 | Tài khoản dịch vụ và khoá API: Ably, Firebase, Cloudinary, SMTP |
| DE-03 | Danh mục nền phải được cấu hình trước khi vận hành: vai trò, quyền, trạng thái job, loại job, phòng ban, chức danh, kênh thanh toán |
| DE-04 | Hạ tầng CI/CD Jenkins và registry Docker |

## 4. Rủi ro (Risks)

| ID | Rủi ro | Ảnh hưởng | Khả năng | Biện pháp giảm thiểu |
| --- | --- | --- | --- | --- |
| RI-01 | Đồng bộ SharePoint thất bại khi tạo job | Cao | Trung bình | Trạng thái `syncStatus`, hàng đợi có retry, cho phép đồng bộ lại hoặc chọn thư mục sẵn có |
| RI-02 | Lộ dữ liệu tài chính nhạy cảm trong nội bộ | Cao | Thấp | Quyền `readIncome`/`readStaffCost`, activity log có `requiredPermissionCode`, audit log |
| RI-03 | Cấu hình quyền sai làm chặn hoặc mở quá mức | Trung bình | Trung bình | Ma trận quyền trực quan, cơ chế deny ưu tiên, nhật ký kiểm toán thay đổi quyền |
| RI-04 | Sai lệch đối soát chi trả hàng loạt | Cao | Thấp | Mỗi payout sinh giao dịch riêng có mã tham chiếu và bằng chứng |
| RI-05 | Phụ thuộc dịch vụ ngoài gián đoạn (Ably/Firebase/Graph) | Trung bình | Trung bình | Xử lý bất đồng bộ, hàng đợi lưu tác vụ, health check và cảnh báo |
| RI-06 | Nhân sự bỏ lỡ deadline do không đọc thông báo | Trung bình | Trung bình | Nhắc tự động hằng ngày, đa kênh thông báo, workbench và overview |
| RI-07 | Thay đổi cấu hình trạng thái job làm hỏng dữ liệu lịch sử | Trung bình | Thấp | `systemType` phân loại ổn định, lịch sử trạng thái lưu độc lập |
| RI-08 | Tăng trưởng dữ liệu job/giao dịch làm chậm truy vấn | Trung bình | Trung bình | Chỉ mục CSDL, phân trang máy chủ, bộ nhớ đệm Redis |

## 5. Tiêu chí chấp nhận tổng thể (Acceptance Criteria)

- Một job đi trọn vòng đời từ tạo mới → phân công → bàn giao → duyệt → thu tiền → chi trả mà không cần thao tác ngoài hệ thống (trừ chuyển tiền thực tế).
- Mọi thao tác nhạy cảm đều bị chặn đúng theo quyền và để lại bản ghi kiểm toán.
- Báo cáo doanh thu và lợi nhuận theo job khớp với sổ cái giao dịch.
- Thư mục SharePoint được tạo đúng cấu trúc mẫu cho 100% job mới.
- Thông báo tới đúng người, đúng sự kiện, trong thời gian thực.

## 6. Thuật ngữ (Glossary)

| Thuật ngữ | Định nghĩa |
| --- | --- |
| **Job** | Một đơn vị công việc/dự án nhận từ khách hàng, có mã duy nhất |
| **Job No.** | Mã định danh job sinh tự động, ví dụ `F260001` |
| **Assignment** | Bản ghi phân công một nhân sự vào một job kèm chi phí |
| **Staff cost** | Chi phí trả cho một nhân sự trên một job |
| **Income cost** | Doanh thu ghi nhận cho job từ khách hàng |
| **Delivery** | Lần nộp kết quả công việc để nghiệm thu |
| **Reviewer** | Người được chỉ định duyệt bàn giao và nhận thông báo cập nhật job |
| **Receivable** | Khoản phải thu từ khách hàng cho job đã hoàn thành |
| **Payout** | Khoản chi trả cho nhân sự theo assignment |
| **Ledger** | Sổ cái tập hợp toàn bộ giao dịch tài chính |
| **Folder Template** | Mẫu cấu trúc thư mục SharePoint dùng nhân bản cho job mới |
| **Workbench** | Không gian làm việc cá nhân liệt kê việc cần xử lý |
| **RBAC** | Kiểm soát truy cập dựa trên vai trò |
| **Deny override** | Quyền bị cấm riêng cho user luôn thắng quyền được cấp bởi vai trò |
| **Audit log** | Nhật ký kiểm toán thao tác toàn hệ thống |
| **MFA / TOTP** | Xác thực hai lớp bằng mã một lần theo thời gian |

## 7. Vấn đề còn để mở (Open Items)

| ID | Nội dung cần xác nhận với nghiệp vụ |
| --- | --- |
| OI-01 | Quy tắc chính thức sinh mã job (tiền tố theo loại job hay theo năm tài chính?) |
| OI-02 | Chính sách quy đổi tỉ giá khi khách hàng dùng `USD` còn chi trả bằng `VND` |
| OI-03 | Thời gian lưu trữ tối thiểu của audit log và nhật ký bảo mật |
| OI-04 | Điều kiện chính xác để một job đủ điều kiện vào danh sách chờ chi trả |
| OI-05 | Có cần cổng khách hàng theo dõi job trong các phiên bản sau hay không |
