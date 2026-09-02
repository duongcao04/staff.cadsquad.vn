---
icon: lucide/users
---

# Stakeholders & Vai trò người dùng

## 1. Các bên liên quan

| Nhóm | Vai trò trong dự án | Mối quan tâm chính |
| --- | --- | --- |
| Ban Điều hành | Business owner, phê duyệt phạm vi | Doanh thu, biên lợi nhuận, năng suất |
| Quản lý vận hành / Project Manager | Người dùng chính, chủ quy trình job | Tiến độ, phân công, chất lượng bàn giao |
| Kế toán / Tài chính | Người dùng phân hệ tài chính | Phải thu, chi trả, đối soát giao dịch |
| Nhân sự thiết kế (Staff) | Người dùng cuối | Việc được giao, deadline, thu nhập theo job |
| Trưởng phòng ban | Quản lý nhóm | Tải công việc, hiệu suất nhân sự |
| Quản trị hệ thống (IT Admin) | Vận hành, phân quyền, cấu hình | Bảo mật, tính sẵn sàng, audit |
| Khách hàng (Client) | Bên ngoài, gián tiếp | Chất lượng và tiến độ bàn giao |

## 2. Vai trò người dùng trong hệ thống

Hệ thống dùng mô hình **RBAC hai lớp**: vai trò (`Role`) gán bộ quyền nền, cộng thêm lớp
`UserPermission` cho phép **cấp thêm** (grant) hoặc **cấm riêng** (deny) từng quyền cho một
người dùng cụ thể — deny luôn thắng.

| Vai trò | Mô tả | Quyền tiêu biểu |
| --- | --- | --- |
| **Administrator** | Toàn quyền quản trị hệ thống | `system.manage`, `role.manage`, `user.manage`, `job.manage` |
| **Accounting** | Kế toán, xử lý tài chính | `job.readIncome`, `job.paid`, `payment.manage`, `analytics.read` |
| **Manager / Reviewer** | Quản lý job, duyệt bàn giao | `job.create`, `job.update`, `job.assignment`, `job.review`, `job.readStaffCost` |
| **Staff** | Nhân sự thực hiện job | Xem job được giao, `job.deliver`, bình luận, cập nhật hồ sơ cá nhân |
| **Community Moderator** | Quản trị nội dung cộng đồng | `community.manage`, `post.manage` |

## 3. Nhóm quyền theo phân hệ

Quyền được định danh theo cấu trúc `entity.action` và gom nhóm theo `PermissionGroup` để hiển
thị trên ma trận phân quyền.

| Nhóm quyền | Các quyền |
| --- | --- |
| Job | `manage`, `readAll`, `readIncome`, `readStaffCost`, `readCancelled`, `create`, `update`, `delete`, `publish`, `deliver`, `review`, `assignment`, `updateFinancial`, `paid` |
| User | `manage`, `create`, `update`, `delete`, `resetPassword`, `block` |
| Role / Permission | `role.manage` |
| Tổ chức | `department.*` (kèm `readSensitive`), `jobTitle.*` |
| CRM | `client.manage/read/write`, `payment.*` |
| Danh mục job | `jobType.*`, `jobStatus.*`, `folderTemplate.*` |
| Cộng đồng | `community.manage/create`, `post.manage/create` |
| Tài sản & hệ thống | `file.manage/read/write`, `system.manage` |
| Phân tích | `analytics.manage/read/report` |

!!! warning "Quy tắc dữ liệu nhạy cảm"

    Doanh thu job (`job.readIncome`) và chi phí nhân sự (`job.readStaffCost`) là hai trường
    nhạy cảm được kiểm soát riêng. Nhật ký hoạt động job (`JobActivityLog`) có trường
    `requiredPermissionCode` — bản ghi chỉ hiển thị cho người dùng có đúng quyền tương ứng;
    ngoài ra chỉ hiển thị phần công khai.

## 4. Ma trận RACI (rút gọn) cho vòng đời job

| Hoạt động | Staff | Manager | Accounting | Admin |
| --- | --- | --- | --- | --- |
| Tạo job | I | **R/A** | I | C |
| Phân công nhân sự & định staff cost | I | **R/A** | C | C |
| Thực hiện & cập nhật tiến độ | **R** | A | I | I |
| Nộp bàn giao (deliver) | **R** | C | I | I |
| Duyệt / từ chối bàn giao | I | **R/A** | I | C |
| Ghi nhận doanh thu & phải thu | I | C | **R/A** | C |
| Chi trả nhân sự (payout) | I | C | **R/A** | A |
| Phân quyền & cấu hình hệ thống | I | I | I | **R/A** |

*R = Thực hiện, A = Chịu trách nhiệm, C = Được hỏi ý kiến, I = Được thông báo.*
