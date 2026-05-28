# TÀI LIỆU KỸ THUẬT: FR-03 - Tài chính & Vận hành (Mini-ERP)

**Module:** Tài chính & Vận hành (Financial / Mini-ERP)  
**Mã YC:** FR-03  

---

## 1. Mô hình Kiến trúc & Thiết kế

Module Tài chính được thiết kế theo chuẩn **CQRS (Command Query Responsibility Segregation)**, phân tách rõ ràng việc đọc dữ liệu (Queries) và ghi dữ liệu (Commands).
- **Commands:** Tạo giao dịch mới, Thanh toán hàng loạt (Bulk Payout).
- **Queries:** Lấy danh sách giao dịch, Thống kê, Báo cáo công nợ (Receivable/Payable).

Cấu trúc Entity xoay quanh `Transaction` kết nối với `Job` và `Client`.

---

## 2. Chi tiết Nghiệp vụ (Business Rules)

### 2.1. Quản lý Giao dịch (Transactions)
Giao dịch được chia thành hai loại chính:
- **INCOME (Thu):** Tiền thu từ Khách hàng. Liên kết trực tiếp tới Doanh thu dự kiến (`incomeCost`) của Job.
- **EXPENSE (Chi):** Tiền chi trả cho Nhân sự (Staff). Liên kết tới danh sách phân công (`JobAssignment`) và `staffCost`.

Giao dịch hỗ trợ ghi nhận qua các Kênh thanh toán (`PaymentChannel`) như Bank, Crypto, E-Wallet và tự động tính/lưu chi phí (Fee) nếu có.

### 2.2. Báo cáo Công nợ (Receivable & Payable)
Hệ thống giải quyết 2 luồng công nợ cốt lõi của một Agency/Studio:
1. **Phải Thu (Receivable - Khách hàng nợ tiền):**
   - API `GET /financials/receivable`.
   - Quét qua tất cả các Job đã hoàn thành/chuyển giao nhưng Khách hàng chưa thanh toán đủ so với tổng `incomeCost`.
   - Phân quyền: Admin thấy tổng công nợ toàn công ty, Staff chỉ thấy công nợ của các Job mình tham gia.
2. **Phải Trả (Payable - Công ty nợ tiền Staff):**
   - API `GET /financials/payable`.
   - Quét qua danh sách `JobAssignment` mà nhân viên đã làm nhưng hệ thống chưa ghi nhận dòng lệnh EXPENSE tương ứng cho họ.

### 2.3. Thanh toán hàng loạt (Bulk Payout)
- API `POST /financials/bulk-payout` cho phép phòng kế toán thanh toán lương/thưởng cho nhiều Job cùng lúc bằng một thao tác duy nhất.
- Hệ thống duyệt qua mảng `jobIds`, tạo đồng loạt các `Transaction` loại EXPENSE gắn với `paymentChannelId` được chọn và đánh dấu `paymentStatus = 'PAID'` ở Job.

### 2.4. Dashboard & Thống kê
- API `GET /financials/stats` tổng hợp doanh thu (Revenue), chi phí (Expense) và tính ra lợi nhuận ròng (Profit) trong chu kỳ (tháng/quý) để hiển thị lên Biểu đồ Dashboard.

---

## 3. Thành phần mã nguồn liên quan
- **Controller:** `server/src/modules/financial/financial.controller.ts`
- **Commands & Queries:** Nằm trong cấu trúc thư mục con `commands/` và `queries/`.
- **Database Schema:** Nằm trong `transaction.prisma` (Liên kết với Job, Client, PaymentChannel).
