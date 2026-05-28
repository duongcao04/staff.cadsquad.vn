# TÀI LIỆU YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS DOCUMENT)

**Dự án:** Cadsquad Staff  
**Phiên bản:** 1.0  
**Ngày cập nhật:** 28/05/2026  
**Trạng thái:** Tài liệu tham chiếu chính thức (Reference Baseline)

---

## 1. Module Xác thực & Phân quyền (Auth & RBAC)

| Mã YC | Tên chức năng | User Story | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **FR-01.1** | **Đăng nhập & MFA** | Là người dùng, tôi muốn đăng nhập an toàn bằng tài khoản nội bộ và xác thực hai yếu tố (MFA) để bảo vệ dữ liệu công ty. | - Hệ thống kiểm tra thông tin đăng nhập hợp lệ.<br>- Yêu cầu nhập mã MFA (OTP/Authenticator) nếu thiết bị hoặc IP mới.<br>- Khóa tài khoản tạm thời sau 5 lần nhập sai.<br>- Sinh ra JWT Token với thời gian hết hạn (expiration time) cấu hình trước. |
| **FR-01.2** | **Quản lý Vai trò (Roles)** | Là Super Admin, tôi muốn tạo và tùy chỉnh các vai trò trong hệ thống để quản lý quyền truy cập linh hoạt. | - Cho phép tạo Role mới (VD: Manager, 3D Artist, Accountant).<br>- Cho phép Gán/Gỡ các quyền (Permissions) cụ thể cho từng Role.<br>- Các thay đổi về quyền phải có hiệu lực ngay lập tức (hoặc sau khi user tải lại trang). |
| **FR-01.3** | **Kiểm soát truy cập (Access Control)** | Là nhân viên, tôi chỉ muốn nhìn thấy các menu và tính năng thuộc về thẩm quyền của mình để giao diện gọn gàng và tránh thao tác nhầm. | - UI tự động ẩn/hiện các component (ví dụ: nút "Duyệt chi") dựa trên phân quyền.<br>- Backend từ chối mọi API request nếu token không có thẩm quyền tương ứng (trả về mã 403 Forbidden). |

---

## 2. Module Quản lý Tài liệu & Tích hợp (SharePoint Integration)

| Mã YC | Tên chức năng | User Story | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **FR-02.1** | **Upload file dung lượng lớn** | Là người dùng, tôi muốn tải các file dự án nặng (1GB - 2GB) lên hệ thống một cách mượt mà, không bị lỗi tràn bộ nhớ hay gián đoạn. | - Giao diện hiển thị thanh tiến trình (progress bar) upload theo thời gian thực.<br>- Hệ thống sử dụng luồng stream dữ liệu đẩy trực tiếp lên SharePoint thông qua Microsoft Graph API.<br>- Hỗ trợ cơ chế tự động thử lại (retry) nếu mạng chập chữa.<br>- Đảm bảo Microservice (Golang) xử lý stream mượt mà mà không bị lỗi Out Of Memory (OOM). |
| **FR-02.2** | **Quản lý Ownership & Chia sẻ** | Là quản lý dự án, tôi muốn phân định rõ quyền sở hữu thư mục cho các đối tác hoặc thành viên đội nhóm để bảo mật tài liệu làm việc. | - Cho phép cấp quyền Đọc/Ghi/Sở hữu cho các cá nhân cụ thể (VD: nhóm nội bộ, hoặc các cộng sự như Phong Pham, Bjorn, Tinh).<br>- Đồng bộ trực tiếp cấu hình phân quyền này với Sharepoint Permissions.<br>- Ghi log lịch sử người thay đổi quyền. |
| **FR-02.3** | **Duyệt & Quản lý thư mục** | Là nhân viên, tôi muốn có giao diện quản lý file trực quan để dễ dàng tìm kiếm, tải xuống và sắp xếp tài liệu dự án. | - Hiển thị cấu trúc cây thư mục chuẩn xác.<br>- Hỗ trợ tìm kiếm theo tên, ngày tạo, người tải lên.<br>- Hỗ trợ thao tác xóa, đổi tên (nếu có quyền). |

---

## 3. Module Tài chính & Vận hành (Mini-ERP)

| Mã YC | Tên chức năng | User Story | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **FR-03.1** | **Tạo Đề xuất thanh toán** | Là nhân viên, tôi muốn tạo các phiếu đề xuất chi phí (mua sắm thiết bị, công tác phí) để phòng tài chính xử lý. | - Form nhập liệu yêu cầu bắt buộc: Tiêu đề, Số tiền, Hạng mục, Ngày cần, File đính kèm (hóa đơn, báo giá).<br>- Trạng thái phiếu mặc định là "Chờ duyệt" (Pending).<br>- Gửi thông báo (Notification) đến người có thẩm quyền duyệt. |
| **FR-03.2** | **Luồng phê duyệt (Approval Workflow)** | Là Finance Manager hoặc Admin, tôi muốn xem xét và duyệt/từ chối các đề xuất thanh toán để kiểm soát dòng tiền. | - Hiển thị danh sách các phiếu đang chờ duyệt.<br>- Cho phép thay đổi trạng thái sang "Đã duyệt", "Từ chối", hoặc "Yêu cầu bổ sung".<br>- Yêu cầu nhập lý do nếu "Từ chối". |
| **FR-03.3** | **Quản lý Ngân sách & Báo cáo** | Là Super Admin, tôi muốn xem báo cáo tổng quan về tình hình thu/chi để đưa ra quyết định vận hành. | - Dashboard hiển thị biểu đồ dòng tiền (Cashflow) theo tháng/quý.<br>- Thống kê chi phí theo từng phòng ban/dự án.<br>- Cho phép xuất báo cáo dưới dạng Excel/CSV. |

---

## 4. Module Quản lý Hồ sơ nhân sự (Staff Profile)

| Mã YC | Tên chức năng | User Story | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **FR-04.1** | **Thông tin cá nhân** | Là nhân viên, tôi muốn tự cập nhật thông tin liên lạc và xem hồ sơ của mình trên hệ thống. | - Cho phép chỉnh sửa số điện thoại, địa chỉ, ảnh đại diện.<br>- Hiển thị thông tin phòng ban, chức vụ, người quản lý trực tiếp (Read-only). |
| **FR-04.2** | **Danh bạ nội bộ** | Là nhân viên, tôi muốn tra cứu thông tin liên lạc của các đồng nghiệp khác để thuận tiện trong công việc. | - Danh sách nhân viên với tính năng tìm kiếm theo tên, phòng ban.<br>- Chỉ hiển thị các thông tin công khai (Email công ty, Số nội bộ, Vị trí). |

---

## 5. Module Quản lý & Vận hành Job (Job Management & Operations)

| Mã YC | Tên chức năng | User Story | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **FR-05.1** | **Khởi tạo & Giao việc (Job Assignment)** | Là Quản lý, tôi muốn tạo Job mới và phân công cho nhân viên để bắt đầu tiến trình thực hiện dự án. | - Cho phép tạo Job với các thông tin: Khách hàng, Loại Job, Mức độ ưu tiên, Deadline, Chi phí dự kiến.<br>- Gán nhân sự thực hiện (Assignee) và người kiểm duyệt (Reviewer).<br>- Tự động khởi tạo cây thư mục Sharepoint dựa trên JobFolderTemplate tương ứng. |
| **FR-05.2** | **Cập nhật & Theo dõi Trạng thái (Workflow)** | Là Nhân viên/Quản lý, tôi muốn cập nhật tiến độ công việc để các bên liên quan nắm bắt được tình trạng hiện tại. | - Hỗ trợ thao tác cập nhật trạng thái (To do, In Progress, Wait Review, Completed).<br>- Hệ thống tự động ghi nhận thời gian bắt đầu và kết thúc của mỗi trạng thái (JobStatusHistory) để đo lường thời gian xử lý (SLA).<br>- Có thể cấu hình giới hạn quyền chuyển trạng thái theo Role (ví dụ: chỉ Quản lý mới được đánh dấu Completed). |
| **FR-05.3** | **Nộp & Duyệt kết quả (Delivery & Approval)** | Là Nhân viên, tôi muốn nộp kết quả công việc (file, link) để quản lý kiểm duyệt. | - Cho phép đính kèm file hoặc link Sharepoint vào luồng giao nộp (JobDelivery).<br>- Quản lý có thể Duyệt (Approve) hoặc Từ chối (Reject) kèm lý do phản hồi.<br>- Khi bị từ chối, Job có thể tự động trả về trạng thái đang thực hiện để nhân viên làm lại. |
| **FR-05.4** | **Nhật ký hoạt động (Audit & Activity Log)** | Là Quản lý, tôi muốn xem lại toàn bộ lịch sử thay đổi của một Job để dễ dàng truy vết. | - Ghi nhận tự động các hành động: Gán/Xóa thành viên, Cập nhật chi phí, Đổi trạng thái, Nộp kết quả.<br>- Phân tách nhật ký thành 2 loại: Public (các thành viên đều thấy) và Private (chỉ những người có quyền hoặc Admin mới xem được, ví dụ: lịch sử thay đổi chi phí/doanh thu). |
| **FR-05.5** | **Thảo luận nội bộ (Job Comments)** | Là Thành viên dự án, tôi muốn trao đổi trực tiếp trong ngữ cảnh của Job để không bị trôi thông tin. | - Hỗ trợ bình luận và phản hồi (Reply) theo cấu trúc thảo luận (Thread).<br>- Tích hợp thông báo (Notification) khi có bình luận mới trong Job. |

---

## 6. Quy tắc Nghiệp vụ Chung (Global Business Rules)
1. **Validation:** Tất cả các trường dữ liệu số tiền trong module Tài chính phải > 0 và được định dạng theo tiền tệ tương ứng (VND/USD).
2. **File Size:** Luồng tải file dung lượng lớn bắt buộc phải đi qua Go stream service để tối ưu tài nguyên hạ tầng.
3. **Audit Log:** Mọi hành động thay đổi trạng thái tài chính (Duyệt/Từ chối) và thay đổi quyền truy cập tệp tin (SharePoint Permissions) đều phải ghi lại log lịch sử không thể xóa (Immutable Logs).
