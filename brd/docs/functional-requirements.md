---
icon: lucide/list-checks
---

# Yêu cầu chức năng

Ký hiệu mức độ ưu tiên: **M** = Must have, **S** = Should have, **C** = Could have.
Tất cả yêu cầu dưới đây đã hiện diện trong hệ thống hiện hành.

## 1. Xác thực & Bảo mật truy cập (BR-AUTH)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-AUTH-01 | Người dùng đăng nhập bằng tài khoản nội bộ (email/username + mật khẩu) | M |
| BR-AUTH-02 | Hỗ trợ đăng nhập bằng tài khoản Microsoft/Azure (SSO doanh nghiệp) | M |
| BR-AUTH-03 | Hỗ trợ xác thực hai lớp (MFA) bằng TOTP, bật/tắt theo người dùng | M |
| BR-AUTH-04 | Đặt lại mật khẩu qua email có mã xác thực hết hạn theo thời gian | M |
| BR-AUTH-05 | Quản lý phiên đăng nhập: xem, thu hồi phiên theo thiết bị (IP, user agent) | S |
| BR-AUTH-06 | Ghi nhật ký bảo mật cho mỗi sự kiện đăng nhập/đổi mật khẩu (`SUCCESS`/`FAILED`/`WARNING`) | M |
| BR-AUTH-07 | Đăng ký thiết bị người dùng để nhận thông báo đẩy | S |

## 2. Phân quyền (BR-RBAC)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-RBAC-01 | Quản trị viên tạo/sửa/xoá vai trò với mã và tên hiển thị duy nhất | M |
| BR-RBAC-02 | Quyền được định danh `entity.action` và gom theo nhóm quyền để hiển thị ma trận | M |
| BR-RBAC-03 | Gán bộ quyền cho vai trò qua ma trận trực quan (permission matrix) | M |
| BR-RBAC-04 | Cấp thêm hoặc cấm riêng một quyền cho từng người dùng; **cấm luôn thắng vai trò** | M |
| BR-RBAC-05 | Mọi endpoint nghiệp vụ nhạy cảm phải kiểm tra quyền phía máy chủ | M |
| BR-RBAC-06 | Giao diện ẩn/hiện chức năng theo quyền thực tế của người dùng | S |

## 3. Quản lý Job (BR-JOB)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-JOB-01 | Tạo job với mã job duy nhất sinh tự động theo quy tắc đánh số (ví dụ `F260001`) | M |
| BR-JOB-02 | Job bắt buộc có: loại job, tên, trạng thái, người tạo, hạn hoàn thành, doanh thu | M |
| BR-JOB-03 | Gắn job với khách hàng, kênh thanh toán, mẫu thư mục và thư mục SharePoint | M |
| BR-JOB-04 | Đặt mức ưu tiên (`LOW`…`URGENT`) và đính kèm tệp/liên kết cho job | M |
| BR-JOB-05 | Phân công nhiều nhân sự vào job, mỗi người có `staffCost` riêng; không trùng lặp | M |
| BR-JOB-06 | Chỉ định danh sách **reviewer**; mọi cập nhật job thông báo tới từng reviewer | M |
| BR-JOB-07 | Chuyển trạng thái job theo cấu hình, kiểm tra vai trò được phép chuyển | M |
| BR-JOB-08 | Chuyển trạng thái hàng loạt (bulk change status) | S |
| BR-JOB-09 | Ghi lịch sử trạng thái kèm thời lượng ở mỗi trạng thái | M |
| BR-JOB-10 | Nhật ký hoạt động job phân loại theo `ActivityType`, có phần riêng tư yêu cầu quyền | M |
| BR-JOB-11 | Bình luận trên job, hỗ trợ trả lời lồng nhau | S |
| BR-JOB-12 | Ghim job vào danh sách theo dõi cá nhân | C |
| BR-JOB-13 | Dời lịch (reschedule) job có ghi nhận lý do vào activity log | S |
| BR-JOB-14 | Xoá mềm và khôi phục job; job đã xoá chỉ hiển thị cho người có quyền | M |
| BR-JOB-15 | Cập nhật doanh thu job tách riêng khỏi cập nhật thông tin chung, yêu cầu quyền tài chính | M |
| BR-JOB-16 | Tìm kiếm, lọc (trạng thái, loại, ưu tiên, khách hàng, người thực hiện, thời gian), sắp xếp và phân trang | M |
| BR-JOB-17 | Tra cứu job theo mã job và theo ngày đến hạn | S |

## 4. Bàn giao & Nghiệm thu (BR-DLV)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-DLV-01 | Nhân sự nộp bàn giao gồm tệp kết quả (đồng bộ SharePoint), link ngoài và ghi chú | M |
| BR-DLV-02 | Một job hỗ trợ nhiều lần bàn giao, lưu đầy đủ lịch sử | M |
| BR-DLV-03 | Người có quyền `job.review` duyệt hoặc từ chối; từ chối bắt buộc có phản hồi | M |
| BR-DLV-04 | Kết quả duyệt tự động cập nhật trạng thái job và gửi thông báo cho người nộp | M |
| BR-DLV-05 | Danh sách "chờ nghiệm thu" (pending deliver) cho người duyệt | M |

## 5. Danh mục & Cấu hình nghiệp vụ (BR-CFG)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-CFG-01 | Quản lý **loại job** (mã, tên, màu, thư mục SharePoint mặc định) | M |
| BR-CFG-02 | Quản lý **trạng thái job**: thứ tự, màu, icon, phân loại hệ thống, vai trò được phép đặt | M |
| BR-CFG-03 | Quản lý **mẫu thư mục job** (folder template) lấy từ SharePoint để nhân bản cho job mới | M |
| BR-CFG-04 | Quản lý **phòng ban** (mã, tên, màu, ghi chú) | M |
| BR-CFG-05 | Quản lý **chức danh** (job title) | M |
| BR-CFG-06 | Quản lý **kênh thanh toán**: ngân hàng / ví điện tử / crypto, phí theo tỉ lệ và phí cố định, trạng thái hoạt động | M |
| BR-CFG-07 | Cấu hình hệ thống dạng key–value có ghi nhận người sửa cuối | S |

## 6. Quản lý khách hàng (BR-CLI)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-CLI-01 | Tạo khách hàng cá nhân/doanh nghiệp với mã và tên duy nhất | M |
| BR-CLI-02 | Lưu thông tin khu vực, quốc gia, địa chỉ, múi giờ, liên hệ, email nhận hoá đơn | M |
| BR-CLI-03 | Lưu mã số thuế, đơn vị tiền tệ và điều khoản thanh toán (số ngày) | M |
| BR-CLI-04 | Xem toàn bộ job và giao dịch theo từng khách hàng | S |

## 7. Phân hệ tài chính (BR-FIN)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-FIN-01 | Ghi nhận giao dịch `INCOME` / `PAYOUT` / `REFUND` gắn với job | M |
| BR-FIN-02 | Giao dịch lưu số tiền, tiền tệ, trạng thái, mã tham chiếu duy nhất, ghi chú và ảnh bằng chứng | M |
| BR-FIN-03 | Sổ cái giao dịch có lọc theo job, loại, trạng thái, thời gian; xem chi tiết từng giao dịch | M |
| BR-FIN-04 | Danh sách **phải thu**: job đã hoàn thành nhưng chưa thu tiền khách | M |
| BR-FIN-05 | Danh sách **chờ chi trả**: job/nhân sự đủ điều kiện nhận thanh toán | M |
| BR-FIN-06 | **Chi trả hàng loạt** (bulk payout) trong một thao tác, sinh giao dịch cho từng nhân sự | M |
| BR-FIN-07 | Đánh dấu job đã thanh toán (`mark-paid`), yêu cầu quyền `job.paid` | M |
| BR-FIN-08 | Thống kê tài chính: doanh thu, chi phí nhân sự, lợi nhuận, theo kỳ | M |
| BR-FIN-09 | Quản lý mẫu hoá đơn (invoice template) | S |
| BR-FIN-10 | Chi tiết tài chính của một job chỉ hiển thị cho người có quyền tương ứng | M |

## 8. Nhân sự & Tổ chức (BR-HR)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-HR-01 | Danh bạ nhân sự có tìm kiếm, lọc theo phòng ban/chức danh/trạng thái | M |
| BR-HR-02 | Hồ sơ nhân sự: mã, ảnh đại diện, email công ty và cá nhân, điện thoại, chức danh, phòng ban | M |
| BR-HR-03 | Thiết lập quan hệ quản lý trực tiếp (manager) và danh sách nhân viên cấp dưới | S |
| BR-HR-04 | Kích hoạt/vô hiệu hoá tài khoản, đặt lại mật khẩu, khôi phục tài khoản đã xoá | M |
| BR-HR-05 | Người dùng tự cập nhật hồ sơ, ảnh đại diện, tuỳ chọn cá nhân | M |
| BR-HR-06 | Lịch làm việc / khả dụng của nhân sự (schedule) | S |

## 9. Không gian làm việc cá nhân (BR-WS)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-WS-01 | **Workbench**: danh sách việc cần làm của cá nhân, có bộ lọc lưu được | M |
| BR-WS-02 | **Overview**: dashboard cá nhân — job đang làm, sắp đến hạn, quá hạn, thu nhập | M |
| BR-WS-03 | **Project Center**: theo dõi job theo tab/nhóm, xuất dữ liệu | S |
| BR-WS-04 | Trung tâm thông báo cá nhân với phân trang và đánh dấu đã đọc | M |
| BR-WS-05 | Tuỳ chọn cá nhân: giao diện sáng/tối, ngôn ngữ (English / Tiếng Việt), múi giờ, định dạng ngày giờ | S |
| BR-WS-06 | Cấu hình kênh nhận thông báo theo từng loại sự kiện | S |

## 10. Báo cáo & Phân tích (BR-ANA)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-ANA-01 | Dashboard tổng quan hệ thống: số job theo trạng thái, khối lượng, xu hướng | M |
| BR-ANA-02 | Phân tích doanh thu theo kỳ, theo khách hàng, theo loại job | M |
| BR-ANA-03 | Chỉ số hiệu suất: thời gian trung bình mỗi trạng thái, tỉ lệ đúng hạn, hoạt động theo ngày | M |
| BR-ANA-04 | Phân bố trạng thái job và hiệu quả tài chính theo nhân sự/phòng ban | S |
| BR-ANA-05 | Xuất báo cáo ra Excel | S |
| BR-ANA-06 | Chỉ người có quyền `analytics.*` mới xem được báo cáo toàn hệ thống | M |

## 11. Tài liệu & Tích hợp SharePoint (BR-DOC)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-DOC-01 | Tạo job kích hoạt sinh thư mục SharePoint từ mẫu thư mục đã chọn | M |
| BR-DOC-02 | Cho phép chọn thư mục SharePoint đã tồn tại thay vì tạo mới | M |
| BR-DOC-03 | Theo dõi trạng thái đồng bộ (`SYNCING` / `SUCCESS` / `FAILED`) và cho phép đồng bộ lại | M |
| BR-DOC-04 | Duyệt cây thư mục/tệp của job ngay trong ứng dụng, mở liên kết web SharePoint | M |
| BR-DOC-05 | Tạo liên kết chia sẻ ẩn danh cho thư mục khi cần gửi khách hàng | S |
| BR-DOC-06 | Quản lý tệp nội bộ (`FileSystem`) gắn job, có kiểm soát người được xem | S |
| BR-DOC-07 | Tải ảnh/tệp lên kho lưu trữ đám mây (gallery, ảnh đại diện, bằng chứng thanh toán) | M |

## 12. Cộng đồng nội bộ (BR-COM)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-COM-01 | Tạo cộng đồng có mã, tên, mô tả, biểu tượng, ảnh bìa | S |
| BR-COM-02 | Quản lý thành viên với vai trò `MEMBER` / `MODERATOR` / `OWNER` | S |
| BR-COM-03 | Tạo chủ đề theo loại: chung, thông báo, tài liệu, ý tưởng, hỗ trợ | S |
| BR-COM-04 | Đăng bài kèm tệp đính kèm, lượt thích, ghim bài | S |
| BR-COM-05 | Gắn sự kiện vào bài đăng (tiêu đề, địa điểm, thời gian, liên kết) | C |

## 13. Quản trị hệ thống (BR-SYS)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| BR-SYS-01 | Nhật ký kiểm toán toàn hệ thống: ai, làm gì, ở phân hệ nào, trên đối tượng nào | M |
| BR-SYS-02 | Audit log lưu ảnh chụp dữ liệu trước/sau, IP và trình duyệt | M |
| BR-SYS-03 | Lọc audit log theo phân hệ, người thực hiện, đối tượng, thời gian; xem chi tiết | M |
| BR-SYS-04 | Admin Inbox tập trung support ticket và báo lỗi từ nhân sự | S |
| BR-SYS-05 | Trung tâm trợ giúp (help center) truy cập được không cần đăng nhập | C |
| BR-SYS-06 | Giám sát tình trạng dịch vụ (health check) và hàng đợi tác vụ nền | M |
