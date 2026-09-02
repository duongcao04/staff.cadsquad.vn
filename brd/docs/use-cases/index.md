---
icon: lucide/layout-list
---

# Danh mục Use Case — Cadsquad Staff Platform

!!! info "Thông tin tài liệu"

    | Mục | Nội dung |
    | --- | --- |
    | **Tài liệu** | Đặc tả Use Case — Cadsquad Staff Platform (CSD-STAFF) |
    | **Phiên bản** | 1.0 (Bản thảo chờ duyệt) |
    | **Ngày tạo** | 02/09/2026 |
    | **Người soạn** | Cadsquad Technology Team |
    | **Chuẩn áp dụng** | Template Use Case 13 trường (Karl Wiegers / IIBA), phân định phạm vi theo goal level của Cockburn |
    | **Nguồn** | [BRD — Cadsquad Staff Platform](../index.md) |
    | **Ngôn ngữ** | Tiếng Việt, giữ nguyên thuật ngữ chuyên ngành |

## 1. Cách xây dựng danh mục này

Use case được nhận diện bằng ba kỹ thuật chuẩn, sau đó lọc lại bằng coffee-break test và
nguyên tắc *một actor / một mục tiêu / một phiên làm việc*.

| Kỹ thuật | Áp dụng cho |
| --- | --- |
| **Goal-driven** | Mục tiêu nghiệp vụ của từng actor lấy từ ma trận RACI trong BRD (tạo job, giao nộp kết quả, chi trả nhân sự, kiểm soát truy cập) |
| **Event-driven** | Sự kiện bên ngoài (nộp, duyệt, thanh toán) và sự kiện nội bộ (cron nhắc deadline, provisioning SharePoint khi tạo job) |
| **CRUD-driven** | Các thực thể nghiệp vụ: Job, Assignment, Delivery, Transaction, Client, User, Role, Payment Channel, Community |

**Các quyết định về phạm vi cần ghi nhận:**

| Quyết định | Lý do |
| --- | --- |
| **Loại bỏ** "Quản lý job" khỏi danh sách use case | Ở summary level (cloud) — trải qua nhiều phiên và nhiều actor. Đã tách thành UC-JOB-01…13. |
| **Gộp** "Duyệt deliverable" và "Từ chối deliverable" thành UC-DLV-02 | Cùng actor, cùng phiên, cùng mục tiêu ("ra quyết định nghiệm thu"). Từ chối là một alternative course, không phải một mục tiêu riêng. |
| "Xác thực OTP" **không** là use case độc lập | Ở sub-function level (fish). Mô hình hoá thành UC-AUTH-04 và chỉ được gọi qua `Includes`. |
| "Tạo folder SharePoint" **không** do actor người khởi tạo | Sự kiện nội bộ kích hoạt bởi việc tạo job. Giữ thành UC-DOC-01 với primary actor là *Job Provisioning Service*, được gọi qua `Includes` từ UC-JOB-01. |
| Danh mục cấu hình giữ một use case cho mỗi thao tác | Các thực thể cấu hình chỉ khác nhau ở dữ liệu nhập, luồng tương tác giống hệt nhau. |

**Cơ sở tính tần suất (giả định AS-F1):** khoảng 50 nhân sự đang hoạt động, khoảng 200 job
tạo mới mỗi tháng, khoảng 250 lượt delivery mỗi tháng, một chu kỳ payout mỗi hai tuần. Mọi
con số tần suất trong danh mục đều suy ra từ cơ sở này và cần Vận hành xác nhận lại.

## 2. Actor

### 2.1 Primary actor (con người)

| Actor | Mô tả | Ánh xạ vai trò hệ thống |
| --- | --- | --- |
| **Nhân sự (Staff Member)** | Người thiết kế/kỹ sư CAD thực hiện job được giao | Staff |
| **Quản lý dự án (Project Manager)** | Chịu trách nhiệm tiếp nhận, phân công và lên lịch job | Manager |
| **Người nghiệm thu (Reviewer)** | Được chỉ định trên job để duyệt hoặc từ chối deliverable | Manager/Reviewer có `job.review` |
| **Kế toán (Accountant)** | Ghi nhận thanh toán từ client và thực hiện payout cho nhân sự | Accounting |
| **Quản trị hệ thống (System Administrator)** | Quản lý tài khoản, role, permission và cấu hình | Administrator |
| **Trưởng phòng ban (Department Head)** | Theo dõi khối lượng và hiệu suất của phòng ban | Manager + `department.readSensitive` |
| **Quản trị cộng đồng (Community Moderator)** | Kiểm duyệt nội dung cộng đồng nội bộ | Community Moderator |

### 2.2 Secondary actor (hệ thống)

| Actor | Vai trò |
| --- | --- |
| **Microsoft Entra ID** | Nhà cung cấp định danh cho SSO doanh nghiệp |
| **Microsoft Graph / SharePoint** | Tạo thư mục tài liệu, duyệt cây thư mục, tạo link chia sẻ |
| **Ably Realtime Service** | Đẩy thông báo in-app theo thời gian thực |
| **Firebase Cloud Messaging** | Push notification tới thiết bị đã đăng ký |
| **SMTP Mail Service** | Email giao dịch (đặt lại mật khẩu, sự kiện quan trọng) |
| **Cloudinary Media Service** | Lưu trữ hình ảnh (avatar, bằng chứng thanh toán, gallery) |
| **System Scheduler** | Cron kích hoạt nhắc deadline và các tác vụ định kỳ |

## 3. Danh sách Use Case

Chú giải — **Level**: `UG` user-goal (sea level), `SF` sub-function (fish, chỉ dùng qua Includes).
**Đặc tả**: ✅ đã đặc tả đầy đủ trong tài liệu này · ⬜ mới ở mức danh mục, chưa đặc tả.

### 3.1 Xác thực & Truy cập (UC-AUTH)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-AUTH-01 | Đăng nhập bằng tài khoản nội bộ | Nhân sự | Có được phiên đăng nhập hợp lệ | UG | Cao | ~60 phiên/ngày | ✅ |
| UC-AUTH-02 | Đăng nhập bằng tài khoản Microsoft | Nhân sự | Đăng nhập không cần nhập mật khẩu | UG | Cao | ~40 phiên/ngày | ✅ |
| UC-AUTH-03 | Kích hoạt xác thực hai lớp | Nhân sự | Bảo vệ tài khoản bằng yếu tố thứ hai TOTP | UG | Cao | ~5 lần/tháng | ✅ |
| UC-AUTH-04 | Xác thực mã một lần | Nhân sự | Chứng minh sở hữu yếu tố thứ hai | SF | Cao | Mỗi lần đăng nhập có MFA | ✅ |
| UC-AUTH-05 | Đặt lại mật khẩu đã quên | Nhân sự | Khôi phục quyền truy cập tài khoản | UG | Cao | ~8 lần/tháng | ✅ |
| UC-AUTH-06 | Thu hồi phiên đăng nhập | Nhân sự | Ngắt truy cập từ thiết bị mất hoặc dùng chung | UG | Trung bình | ~4 lần/tháng | ⬜ |
| UC-AUTH-07 | Đăng ký thiết bị nhận push notification | Nhân sự | Nhận cảnh báo trên thiết bị tin cậy | UG | Trung bình | ~50 lần/quý | ⬜ |

### 3.2 Phân quyền (UC-RBAC)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-RBAC-01 | Tạo role | Quản trị hệ thống | Định nghĩa một bộ permission dùng lại được | UG | Cao | ~2 lần/quý | ✅ |
| UC-RBAC-02 | Gán permission cho role | Quản trị hệ thống | Khớp role với chức năng công việc thực tế | UG | Cao | ~6 lần/quý | ✅ |
| UC-RBAC-03 | Ghi đè permission cho một nhân sự | Quản trị hệ thống | Cấp thêm hoặc cấm riêng một quyền cho một người | UG | Cao | ~4 lần/tháng | ✅ |
| UC-RBAC-04 | Gán role cho nhân sự | Quản trị hệ thống | Trao quyền truy cập vận hành cho một người | UG | Cao | ~10 lần/tháng | ⬜ |

### 3.3 Quản lý Job (UC-JOB)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-JOB-01 | Tạo job | Quản lý dự án | Đưa đơn hàng của client thành job theo dõi được | UG | Cao | ~200/tháng | ✅ |
| UC-JOB-02 | Phân công nhân sự vào job | Quản lý dự án | Cam kết nguồn lực và staff cost cho job | UG | Cao | ~250/tháng | ✅ |
| UC-JOB-03 | Điều chỉnh staff cost của assignment | Quản lý dự án | Sửa lại chi phí đã thoả thuận với một người | UG | Cao | ~40/tháng | ✅ |
| UC-JOB-04 | Gỡ nhân sự khỏi job | Quản lý dự án | Giải phóng nguồn lực không còn cần đến | UG | Trung bình | ~20/tháng | ⬜ |
| UC-JOB-05 | Chuyển trạng thái job | Nhân sự | Đưa job đi tiếp trong workflow | UG | Cao | ~900/tháng | ✅ |
| UC-JOB-06 | Chuyển trạng thái nhiều job cùng lúc | Quản lý dự án | Đóng một loạt job trong một thao tác | UG | Trung bình | ~10/tháng | ⬜ |
| UC-JOB-07 | Cập nhật thông tin chung của job | Quản lý dự án | Giữ thông tin job luôn chính xác | UG | Cao | ~120/tháng | ⬜ |
| UC-JOB-08 | Cập nhật doanh thu job | Quản lý dự án | Ghi nhận giá đã chốt với client | UG | Cao | ~60/tháng | ✅ |
| UC-JOB-09 | Dời deadline của job | Quản lý dự án | Dời hạn hoàn thành có ghi vết lý do | UG | Trung bình | ~30/tháng | ✅ |
| UC-JOB-10 | Tìm kiếm và lọc job | Nhân sự | Tìm đúng job liên quan tới việc đang làm | UG | Cao | ~500/tháng | ⬜ |
| UC-JOB-11 | Bình luận trên job | Nhân sự | Trao đổi ngay trong ngữ cảnh của job | UG | Trung bình | ~400/tháng | ⬜ |
| UC-JOB-12 | Ghim job vào danh sách theo dõi | Nhân sự | Giữ job ưu tiên trong tầm một cú click | UG | Thấp | ~100/tháng | ⬜ |
| UC-JOB-13 | Xoá job | Quản lý dự án | Rút lại job tạo nhầm hoặc bị huỷ | UG | Trung bình | ~8/tháng | ✅ |
| UC-JOB-14 | Khôi phục job đã xoá | Quản trị hệ thống | Lấy lại job bị xoá nhầm | UG | Thấp | ~1/tháng | ⬜ |
| UC-JOB-15 | Tra cứu nhật ký hoạt động của job | Quản lý dự án | Truy vết ai đã thay đổi gì trên job | UG | Trung bình | ~60/tháng | ⬜ |

### 3.4 Bàn giao & Nghiệm thu (UC-DLV)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-DLV-01 | Nộp deliverable của job | Nhân sự | Bàn giao kết quả để được nghiệm thu | UG | Cao | ~250/tháng | ✅ |
| UC-DLV-02 | Quyết định nghiệm thu deliverable | Người nghiệm thu | Chấp nhận hoặc trả lại kết quả đã nộp | UG | Cao | ~250/tháng | ✅ |
| UC-DLV-03 | Xem hàng đợi chờ nghiệm thu | Người nghiệm thu | Nắm toàn bộ việc đang chờ mình quyết định | UG | Cao | ~150/tháng | ⬜ |

### 3.5 Tài chính (UC-FIN)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-FIN-01 | Ghi nhận thanh toán từ client | Kế toán | Tất toán một khoản receivable có bằng chứng đối soát | UG | Cao | ~120/tháng | ✅ |
| UC-FIN-02 | Thực hiện payout hàng loạt cho nhân sự | Kế toán | Chi trả toàn bộ khoản đủ điều kiện trong một kỳ | UG | Cao | ~2/tháng | ✅ |
| UC-FIN-03 | Rà soát danh sách receivable | Kế toán | Xác định các job đã hoàn thành nhưng chưa thu tiền | UG | Cao | ~40/tháng | ✅ |
| UC-FIN-04 | Tra cứu ledger giao dịch | Kế toán | Đối soát dữ liệu hệ thống với sao kê ngân hàng | UG | Cao | ~60/tháng | ⬜ |
| UC-FIN-05 | Ghi nhận hoàn tiền | Kế toán | Đảo một khoản đã thu khi có tranh chấp | UG | Trung bình | ~3/tháng | ⬜ |
| UC-FIN-06 | Cấu hình payment channel | Kế toán | Giữ các kênh thu chi luôn cập nhật | UG | Trung bình | ~2/quý | ⬜ |
| UC-FIN-07 | Xem chi tiết tài chính của job | Quản lý dự án | Đánh giá biên lợi nhuận trước khi cam kết chi phí | UG | Cao | ~150/tháng | ⬜ |

### 3.6 Nhân sự & Tổ chức (UC-HR)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-HR-01 | Tạo tài khoản nhân sự | Quản trị hệ thống | Onboard nhân sự mới vào nền tảng | UG | Cao | ~5/tháng | ✅ |
| UC-HR-02 | Vô hiệu hoá tài khoản nhân sự | Quản trị hệ thống | Cắt truy cập khi nhân sự nghỉ việc | UG | Cao | ~3/tháng | ✅ |
| UC-HR-03 | Đặt lại mật khẩu cho nhân sự | Quản trị hệ thống | Khôi phục truy cập cho đồng nghiệp bị khoá | UG | Trung bình | ~5/tháng | ⬜ |
| UC-HR-04 | Cập nhật hồ sơ cá nhân | Nhân sự | Giữ thông tin cá nhân và liên hệ luôn đúng | UG | Trung bình | ~30/tháng | ⬜ |
| UC-HR-05 | Cập nhật tuỳ chọn cá nhân | Nhân sự | Chỉnh ngôn ngữ, giao diện và kênh thông báo | UG | Thấp | ~40/tháng | ⬜ |
| UC-HR-06 | Tra cứu danh bạ nhân sự | Nhân sự | Tìm đồng nghiệp và phòng ban của họ | UG | Trung bình | ~200/tháng | ⬜ |
| UC-HR-07 | Quản lý lịch làm việc | Trưởng phòng ban | Công bố khả dụng phục vụ điều phối nguồn lực | UG | Trung bình | ~20/tháng | ⬜ |

### 3.7 Khách hàng & Cấu hình (UC-CLI / UC-CFG)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-CLI-01 | Đăng ký client | Quản lý dự án | Cho phép tạo job và xuất hoá đơn cho khách hàng | UG | Cao | ~4/tháng | ✅ |
| UC-CLI-02 | Cập nhật điều khoản thương mại của client | Kế toán | Giữ đúng đơn vị tiền tệ và payment terms | UG | Trung bình | ~5/tháng | ⬜ |
| UC-CFG-01 | Cấu hình workflow trạng thái job | Quản trị hệ thống | Khớp trạng thái hệ thống với quy trình vận hành | UG | Cao | ~1/quý | ✅ |
| UC-CFG-02 | Tạo loại job | Quản trị hệ thống | Phân loại job phục vụ điều phối và báo cáo | UG | Trung bình | ~2/quý | ⬜ |
| UC-CFG-03 | Tạo folder template cho job | Quản trị hệ thống | Chuẩn hoá cấu trúc tài liệu cho job mới | UG | Trung bình | ~2/quý | ✅ |
| UC-CFG-04 | Quản lý phòng ban | Quản trị hệ thống | Phản ánh đúng cơ cấu tổ chức | UG | Trung bình | ~2/quý | ⬜ |
| UC-CFG-05 | Quản lý chức danh | Quản trị hệ thống | Giữ danh mục chức danh luôn cập nhật | UG | Thấp | ~2/quý | ⬜ |

### 3.8 Tài liệu & SharePoint (UC-DOC)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-DOC-01 | Tạo folder SharePoint cho job | Job Provisioning Service | Tự động tạo cấu trúc tài liệu chuẩn | SF | Cao | ~200/tháng | ✅ |
| UC-DOC-02 | Liên kết job với folder SharePoint có sẵn | Quản lý dự án | Dùng lại folder đã tạo ngoài hệ thống | UG | Cao | ~30/tháng | ✅ |
| UC-DOC-03 | Đồng bộ lại SharePoint sau khi thất bại | Quản lý dự án | Khôi phục job chưa có folder tài liệu | UG | Cao | ~15/tháng | ✅ |
| UC-DOC-04 | Duyệt thư viện tài liệu của job | Nhân sự | Truy cập file của job ngay trong nền tảng | UG | Cao | ~600/tháng | ⬜ |
| UC-DOC-05 | Chia sẻ folder job bằng link ẩn danh | Quản lý dự án | Gửi kết quả cho client không có tài khoản | UG | Trung bình | ~40/tháng | ⬜ |

### 3.9 Thông báo, Phân tích & Hệ thống (UC-NOT / UC-ANA / UC-SYS)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-NOT-01 | Gửi nhắc deadline job | System Scheduler | Cảnh báo người phụ trách trước khi job trễ hạn | UG | Cao | 1 lần/ngày | ✅ |
| UC-NOT-02 | Xử lý danh sách thông báo | Nhân sự | Nắm hết những việc cần chú ý | UG | Cao | ~1.500/tháng | ⬜ |
| UC-ANA-01 | Xem workbench cá nhân | Nhân sự | Quyết định việc tiếp theo cần làm | UG | Cao | ~1.000/tháng | ✅ |
| UC-ANA-02 | Xem dashboard tổng quan hệ thống | Trưởng phòng ban | Theo dõi thông lượng và điểm nghẽn | UG | Cao | ~120/tháng | ⬜ |
| UC-ANA-03 | Phân tích hiệu quả doanh thu | Kế toán | Báo cáo doanh thu và biên lợi nhuận theo kỳ | UG | Cao | ~10/tháng | ⬜ |
| UC-ANA-04 | Xuất báo cáo ra Excel | Kế toán | Chia sẻ số liệu ra ngoài nền tảng | UG | Trung bình | ~20/tháng | ⬜ |
| UC-SYS-01 | Điều tra audit log hệ thống | Quản trị hệ thống | Truy vết một thao tác đáng ngờ hoặc bị tranh chấp | UG | Cao | ~20/tháng | ✅ |
| UC-SYS-02 | Gửi ticket hỗ trợ | Nhân sự | Được trợ giúp khi gặp vướng mắc | UG | Trung bình | ~25/tháng | ⬜ |
| UC-SYS-03 | Xử lý ticket hỗ trợ | Quản trị hệ thống | Đóng dứt điểm một vấn đề được báo cáo | UG | Trung bình | ~25/tháng | ⬜ |

### 3.10 Cộng đồng (UC-COM)

| Mã UC | Tên Use Case | Primary Actor | Mục tiêu | Level | Ưu tiên | Tần suất | Đặc tả |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UC-COM-01 | Tạo cộng đồng | Quản trị cộng đồng | Mở không gian cho một nhóm hoặc chủ đề | UG | Thấp | ~1/quý | ⬜ |
| UC-COM-02 | Tạo topic trong cộng đồng | Quản trị cộng đồng | Sắp xếp thảo luận theo mục đích | UG | Thấp | ~4/tháng | ⬜ |
| UC-COM-03 | Đăng bài viết | Nhân sự | Chia sẻ thông tin với đồng nghiệp | UG | Thấp | ~150/tháng | ⬜ |
| UC-COM-04 | Thông báo sự kiện | Quản trị cộng đồng | Kéo đồng nghiệp tham gia sự kiện đã lên lịch | UG | Thấp | ~4/tháng | ⬜ |

## 4. Thứ tự đặc tả đề xuất

31 use case đánh dấu ✅ được chọn vì chúng nắm giữ dòng tiền, kiểm soát truy cập, hoặc tạo ra
thay đổi trạng thái không thể đảo ngược — đúng những chỗ mà một giả định không được viết ra
sẽ trở thành lỗi sản phẩm.

| Đợt | Use case | Vì sao làm trước |
| --- | --- | --- |
| **Đợt 1 — Luồng doanh thu cốt lõi** | UC-JOB-01, UC-JOB-02, UC-DLV-01, UC-DLV-02, UC-FIN-01, UC-FIN-02 | Toàn bộ hành trình của job từ đơn hàng tới tiền về. Hở chỗ nào ở đây là mất tiền trực tiếp. |
| **Đợt 2 — Chốt chặn truy cập và tiền** | UC-AUTH-01…05, UC-RBAC-01…03, UC-JOB-08, UC-FIN-03, UC-SYS-01 | Lộ dữ liệu nhạy cảm (RI-02) và sai sót payout (RI-04) là hai rủi ro được BRD đánh giá cao nhất. |
| **Đợt 3 — Toàn vẹn workflow** | UC-JOB-03, UC-JOB-05, UC-JOB-09, UC-JOB-13, UC-CFG-01, UC-NOT-01 | Mô hình trạng thái và xử lý deadline chi phối OBJ-02 và OBJ-03 (thời gian chu trình, tỉ lệ đúng hạn). |
| **Đợt 4 — Tài liệu và onboarding** | UC-DOC-01…03, UC-CFG-03, UC-HR-01, UC-HR-02, UC-CLI-01, UC-ANA-01 | Lỗi đồng bộ SharePoint (RI-01) là rủi ro vận hành có khả năng xảy ra cao nhất. |
| **Đợt 5 — Các mục ⬜ còn lại** | Báo cáo, cộng đồng, tuỳ chọn cá nhân, danh bạ | Phạm vi ảnh hưởng nhỏ hơn, có thể đặc tả trong lúc xây dựng. |

### Những use case đáng lưu ý nhưng hay bị bỏ sót

| UC | Vì sao hay bị bỏ sót |
| --- | --- |
| UC-JOB-03 *Điều chỉnh staff cost* | Thay đổi chi phí đã cam kết sau khi việc đã bắt đầu — cần vết audit và quy tắc cấm sửa sau khi đã payout. |
| UC-JOB-13 / UC-JOB-14 *Xoá và khôi phục job* | Xoá mềm nghĩa là job "đã xoá" vẫn giữ bản ghi tài chính; luồng khôi phục hiếm khi được đặc tả. |
| UC-DOC-03 *Đồng bộ lại SharePoint* | Điểm hỏng bên ngoài dễ xảy ra nhất, nhưng thường bị mặc định là "chắc nó tự chạy được". |
| UC-RBAC-03 *Ghi đè permission* | Ngữ nghĩa deny thắng grant là nguồn gốc thường gặp của sự cố truy cập trên production. |
| UC-NOT-01 *Nhắc deadline* | Use case do hệ thống kích hoạt, không có người khởi tạo — thường bị bỏ hẳn khỏi bộ UC. |
| UC-FIN-05 *Ghi nhận hoàn tiền* | Luồng duy nhất làm tiền chảy ngược; cần quy tắc rõ ràng cấm sửa giao dịch đã tất toán. |
| UC-AUTH-06 *Thu hồi phiên đăng nhập* | Cần cho offboarding và thiết bị bị mất; thường chỉ được phát hiện sau một sự cố bảo mật. |

## 5. Các tài liệu đặc tả

| Phân hệ | Tài liệu |
| --- | --- |
| Xác thực & Phân quyền | [UC-AUTH / UC-RBAC](uc-auth.md) |
| Quản lý Job | [UC-JOB](uc-job.md) |
| Bàn giao & Nghiệm thu | [UC-DLV](uc-delivery.md) |
| Tài chính | [UC-FIN](uc-financial.md) |
| Nhân sự, Khách hàng & Cấu hình | [UC-HR / UC-CLI / UC-CFG](uc-workforce.md) |
| Tài liệu & SharePoint | [UC-DOC](uc-documents.md) |
| Thông báo, Phân tích & Hệ thống | [UC-NOT / UC-ANA / UC-SYS](uc-system.md) |
| Kiểm tra chất lượng | [Kết quả checklist 20 điểm](validation.md) |
