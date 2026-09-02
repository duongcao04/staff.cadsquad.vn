---
icon: lucide/file-text
---

# BRD — Cadsquad Staff Platform

!!! info "Thông tin tài liệu"

    | Mục | Nội dung |
    | --- | --- |
    | **Tên tài liệu** | Business Requirements Document (BRD) — Cadsquad Staff Platform |
    | **Mã hệ thống** | CSD-STAFF |
    | **Phiên bản** | 1.0 (Draft) |
    | **Ngày phát hành** | 02/09/2026 |
    | **Người soạn** | Cadsquad Technology Team |
    | **Chủ sở hữu nghiệp vụ** | Ban Điều hành Cadsquad |
    | **Nguồn dữ liệu** | Reverse-engineering từ mã nguồn `csd-staff` (client + server + schema CSDL) |
    | **Liên hệ** | ch.duong@cadsquad.vn |

## 1. Executive Summary

Cadsquad Staff Platform là hệ thống quản trị vận hành nội bộ (internal operations platform)
hợp nhất cho Cadsquad — một đơn vị cung cấp dịch vụ thiết kế/CAD theo mô hình **job-based
outsourcing**. Hệ thống thay thế cách làm rời rạc (Excel, chat, SharePoint thủ công) bằng một
nền tảng duy nhất quản lý toàn bộ vòng đời công việc: từ tiếp nhận job của khách hàng → phân
công nhân sự → theo dõi tiến độ → nghiệm thu deliverable → ghi nhận doanh thu và chi trả
nhân sự.

Ba trụ cột nghiệp vụ:

1. **Job Lifecycle Management** — quản lý job end-to-end, có workflow trạng thái, deliver/review, SLA deadline.
2. **Financial Control** — doanh thu theo job, chi phí nhân sự, công nợ phải thu (receivable), chi trả (payout), sổ cái giao dịch.
3. **Workforce & Governance** — hồ sơ nhân sự, phòng ban, chức danh, phân quyền chi tiết (RBAC + override), nhật ký kiểm toán.

## 2. Bối cảnh & Vấn đề nghiệp vụ

| Vấn đề hiện trạng | Tác động |
| --- | --- |
| Job theo dõi phân tán trên Excel/chat | Mất dấu tiến độ, không có SLA, khó truy vết trách nhiệm |
| Thư mục SharePoint tạo thủ công cho mỗi job | Sai cấu trúc, tốn thời gian, khó chuẩn hoá bàn giao |
| Chi phí nhân sự và doanh thu job không gắn với nhau | Không tính được biên lợi nhuận thực theo job |
| Chi trả nhân sự tính tay theo kỳ | Sai sót, chậm trễ, thiếu bằng chứng đối soát |
| Không có kiểm soát truy cập theo vai trò | Dữ liệu tài chính nhạy cảm bị lộ nội bộ |
| Thông báo qua nhiều kênh không tập trung | Bỏ lỡ deadline, chậm nghiệm thu |

## 3. Mục tiêu kinh doanh & Chỉ số thành công

| ID | Mục tiêu kinh doanh | Chỉ số đo lường (KPI) |
| --- | --- | --- |
| OBJ-01 | Tập trung hoá quản lý job | 100% job phát sinh được tạo trên hệ thống, có mã job duy nhất |
| OBJ-02 | Rút ngắn thời gian chu trình job | Giảm thời gian trung bình mỗi trạng thái (đo bằng `JobStatusHistory`) |
| OBJ-03 | Nâng tỉ lệ giao hàng đúng hạn | % job hoàn thành trước `dueAt`; giảm job quá hạn |
| OBJ-04 | Minh bạch tài chính theo job | Mỗi job có doanh thu, tổng chi phí nhân sự và biên lợi nhuận truy vết được |
| OBJ-05 | Tự động hoá chi trả nhân sự | Thời gian xử lý một kỳ payout; 100% payout có giao dịch đối soát |
| OBJ-06 | Chuẩn hoá lưu trữ tài liệu | 100% job mới sinh thư mục SharePoint từ folder template |
| OBJ-07 | Kiểm soát truy cập & tuân thủ | Mọi thao tác nhạy cảm có bản ghi audit log kèm actor/IP |

## 4. Phạm vi

### 4.1 Trong phạm vi (In scope)

- Quản lý job, loại job, trạng thái job, mức ưu tiên, deadline, ghim job.
- Phân công nhân sự vào job kèm chi phí nhân sự (staff cost) từng người.
- Quy trình bàn giao (delivery) — nộp kết quả, duyệt/từ chối, phản hồi.
- Quản lý khách hàng (client) và điều khoản thanh toán.
- Phân hệ tài chính: giao dịch, sổ cái, phải thu, chi trả hàng loạt, kênh thanh toán, mẫu hoá đơn.
- Quản trị nhân sự: danh bạ nhân sự, phòng ban, chức danh, cây quản lý (manager/report).
- Kiểm soát truy cập: vai trò, quyền, nhóm quyền, quyền cấp/cấm riêng cho từng user.
- Xác thực: đăng nhập nội bộ, đăng nhập Microsoft/Azure, MFA (TOTP), phiên & thiết bị.
- Thông báo đa kênh (in-app realtime, push, email) và nhắc deadline tự động.
- Community: cộng đồng, chủ đề, bài đăng, sự kiện.
- Tích hợp SharePoint/Microsoft Graph để tạo và đồng bộ thư mục job.
- Báo cáo & phân tích: dashboard cá nhân, tổng quan hệ thống, doanh thu, hiệu suất.
- Audit log hệ thống và nhật ký bảo mật người dùng.
- Trung tâm hỗ trợ (support ticket) và cấu hình hệ thống.
- Đa nền tảng: web (browser) và ứng dụng desktop (Tauri).

### 4.2 Ngoài phạm vi (Out of scope)

- Cổng khách hàng (client-facing portal) để khách tự theo dõi job.
- Kế toán tài chính đầy đủ (sổ sách thuế, báo cáo tài chính pháp định).
- Chấm công/tính lương cứng theo hợp đồng lao động (HRM payroll đầy đủ).
- Thanh toán trực tuyến tự động qua cổng thanh toán (hiện là đối soát thủ công có bằng chứng).
- Quản lý mua sắm, kho, tài sản cố định.
- Ứng dụng di động native (iOS/Android).

## 5. Cấu trúc tài liệu

| Chương | Nội dung |
| --- | --- |
| [Stakeholders & Vai trò](stakeholders.md) | Các bên liên quan, vai trò người dùng, ma trận quyền |
| [Quy trình nghiệp vụ](processes.md) | Vòng đời job, bàn giao, chi trả, onboarding nhân sự |
| [Yêu cầu chức năng](functional-requirements.md) | Danh mục yêu cầu nghiệp vụ theo phân hệ (BR-xxx) |
| [Yêu cầu phi chức năng](non-functional.md) | Hiệu năng, bảo mật, khả dụng, vận hành |
| [Dữ liệu & Tích hợp](data-integration.md) | Thực thể nghiệp vụ, tích hợp bên thứ ba, báo cáo |
| [Giả định, Rủi ro & Thuật ngữ](assumptions-risks.md) | Giả định, ràng buộc, phụ thuộc, rủi ro, glossary |
