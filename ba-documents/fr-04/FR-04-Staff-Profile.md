# TÀI LIỆU KỸ THUẬT: FR-04 - Quản lý Hồ sơ Nhân sự (Staff Profile)

**Module:** Quản lý Hồ sơ nhân sự (Staff Profile)  
**Mã YC:** FR-04  

---

## 1. Luồng Khởi tạo & Cấp tài khoản

Khi Admin thêm một nhân sự mới vào hệ thống (`UserService.create`), một loạt tác vụ tự động được thực hiện:
1. **Sinh User Name (Username Generation):** 
   - Hệ thống tự động cắt phần tiền tố của Email làm username (VD: `ch.duong@cadsquad.vn` -> `ch.duong`). 
   - Nếu trùng lặp, sẽ cộng thêm chuỗi ngẫu nhiên 4 ký tự phía sau (VD: `ch.duong.a1b2`) để đảm bảo tính duy nhất.
2. **Sinh Mã Nhân viên (Staff Code):** 
   - Hệ thống quét danh sách nhân viên cũ, tìm mã mới nhất và cộng thêm 1. (VD: `ST001` -> `ST002`).
3. **Sinh Avatar (Avatar Generation):**
   - Không cần tải ảnh ngay. Hệ thống gửi Tên hiển thị (Display Name) tới API của `ui-avatars.com` để tự sinh một ảnh đại diện theo chữ cái đầu với màu sắc ngẫu nhiên.
4. **Phân Quyền (Default Role):**
   - Nếu không được chọn Role, User được tự động gán vào Role mặc định là `staff`.
5. **Gửi Thư Mời (Invitation Email):**
   - Nếu tích chọn gửi Email, hệ thống dùng `MailService` đẩy thông báo chứa mật khẩu tạm để nhân viên đăng nhập.

## 2. Tìm kiếm & Danh bạ Nội bộ (Directory)

Hệ thống cho phép tra cứu đồng nghiệp dễ dàng thông qua API `findAll` (Dạng bảng cho Admin) và `search` (Dạng tìm kiếm nhanh trên thanh điều hướng).
- Hỗ trợ phân trang, lọc theo phòng ban (`departmentId`) và chức vụ (`role`).
- Tìm kiếm từ khóa không phân biệt hoa thường (`insensitive`) quét trên cả Tên, Email, Username.

## 3. Thay đổi Trạng thái & Xóa Mềm (Soft Delete)

Để bảo đảm tính toàn vẹn dữ liệu cho các dự án cũ (Job History), hệ thống KHÔNG sử dụng lệnh xóa cứng (Hard Delete). Thay vào đó:
1. **Thay đổi trạng thái (Toggle Status):** 
   - Vô hiệu hóa tài khoản (`isActive = false`). Nhân sự bị khóa sẽ không thể đăng nhập. Ngay sau khi khóa/mở, hệ thống bắn Email thông báo cập nhật trạng thái tài khoản. (Admin không được tự khóa chính mình).
2. **Xóa mềm (Soft Delete):** 
   - Trước khi xóa, hệ thống kiểm tra số lượng các Job **đang hoạt động** mà nhân viên này tham gia. Nếu > 0, hệ thống chặn xóa và ném lỗi `BadRequestException`.
   - Quá trình xóa mềm bao gồm: Set `isActive = false`, gán `deletedAt = now()`, reset mật khẩu thành `DELETED_USER_ACCOUNT` (khóa vĩnh viễn), và quan trọng nhất là đổi tên `username` thành dạng `[username_cũ]_deleted-[timestamp]` để giải phóng username đó cho người khác nếu cần tái sử dụng.
3. **Khôi phục (Restore):** 
   - Quét bỏ chuỗi `_deleted-xxx`, khôi phục lại mật khẩu mặc định (`cadsquad123`) và role `staff`, đồng thời gỡ `deletedAt`.

---

## 4. Thành phần mã nguồn liên quan
- **Service:** `server/src/modules/user/user.service.ts`
- **Controller:** `server/src/modules/user/user.controller.ts`
- **Tích hợp:** `MailService` (Gửi email), `BcryptService` (Băm mật khẩu).
