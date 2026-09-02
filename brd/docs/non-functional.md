---
icon: lucide/shield-check
---

# Yêu cầu phi chức năng

## 1. Bảo mật (NFR-SEC)

| ID | Yêu cầu |
| --- | --- |
| NFR-SEC-01 | Mật khẩu lưu dạng băm (bcrypt); không lưu mật khẩu dạng rõ |
| NFR-SEC-02 | Phiên làm việc dùng token có hạn, thu hồi được theo thiết bị |
| NFR-SEC-03 | MFA bằng TOTP cho tài khoản có quyền nhạy cảm |
| NFR-SEC-04 | Kiểm tra quyền tại tầng máy chủ cho mọi thao tác; giao diện chỉ là lớp ẩn hiện |
| NFR-SEC-05 | Dữ liệu tài chính (doanh thu job, chi phí nhân sự) chỉ trả về khi người gọi có quyền tương ứng |
| NFR-SEC-06 | Mọi thao tác thay đổi dữ liệu quan trọng ghi audit log kèm IP và user agent |
| NFR-SEC-07 | Token truy cập Microsoft/Azure lưu trữ an toàn, có refresh token và thời hạn |
| NFR-SEC-08 | Biến môi trường/bí mật không được commit vào mã nguồn |

## 2. Hiệu năng & Khả năng mở rộng (NFR-PERF)

| ID | Yêu cầu |
| --- | --- |
| NFR-PERF-01 | Danh sách job, giao dịch, nhân sự phải phân trang phía máy chủ |
| NFR-PERF-02 | Truy vấn theo mã job, trạng thái, người tạo, mức ưu tiên, thời gian có chỉ mục CSDL |
| NFR-PERF-03 | Tác vụ nặng (thông báo, đồng bộ SharePoint, chi trả hàng loạt) chạy bất đồng bộ qua hàng đợi |
| NFR-PERF-04 | Có bộ nhớ đệm (Redis) cho dữ liệu tra cứu thường xuyên và hàng đợi |
| NFR-PERF-05 | Ứng dụng chạy được trong giới hạn tài nguyên container đã cấu hình (backend ~450MB RAM) |

## 3. Tính sẵn sàng & Vận hành (NFR-OPS)

| ID | Yêu cầu |
| --- | --- |
| NFR-OPS-01 | Endpoint health check cho từng thành phần (CSDL, Redis, dịch vụ ngoài) |
| NFR-OPS-02 | Xuất metrics dạng Prometheus phục vụ giám sát |
| NFR-OPS-03 | Bảng điều khiển hàng đợi để theo dõi và xử lý lại tác vụ lỗi |
| NFR-OPS-04 | Triển khai bằng Docker Compose, CI/CD qua Jenkins |
| NFR-OPS-05 | CSDL PostgreSQL có sao lưu định kỳ; múi giờ hệ thống `Asia/Ho_Chi_Minh` |
| NFR-OPS-06 | Ghi log có cấu trúc cho mọi tác vụ nền và tích hợp bên ngoài |

## 4. Khả dụng & Trải nghiệm (NFR-UX)

| ID | Yêu cầu |
| --- | --- |
| NFR-UX-01 | Giao diện đáp ứng trên trình duyệt hiện đại và ứng dụng desktop (Tauri) |
| NFR-UX-02 | Hỗ trợ song ngữ: English (`en-US`) và Tiếng Việt (`vi-VN`) |
| NFR-UX-03 | Hỗ trợ chế độ sáng/tối theo tuỳ chọn người dùng hoặc hệ điều hành |
| NFR-UX-04 | Cập nhật thời gian thực cho thông báo và thay đổi trạng thái job |
| NFR-UX-05 | Định dạng ngày giờ và tiền tệ theo tuỳ chọn khu vực của người dùng |

## 5. Toàn vẹn & Truy vết dữ liệu (NFR-DATA)

| ID | Yêu cầu |
| --- | --- |
| NFR-DATA-01 | Mã job, mã nhân sự, mã khách hàng, mã tham chiếu giao dịch là duy nhất |
| NFR-DATA-02 | Không cho phép phân công trùng một nhân sự hai lần trên cùng job |
| NFR-DATA-03 | Xoá dữ liệu nghiệp vụ dùng xoá mềm để phục hồi và truy vết |
| NFR-DATA-04 | Mọi bản ghi có `createdAt` / `updatedAt`; thay đổi trạng thái có lịch sử riêng |
| NFR-DATA-05 | Giao dịch tài chính không được sửa xoá tuỳ tiện; điều chỉnh bằng giao dịch đối ứng |

## 6. Tuân thủ & Kiểm toán (NFR-COMP)

| ID | Yêu cầu |
| --- | --- |
| NFR-COMP-01 | Lưu vết đầy đủ chuỗi phê duyệt bàn giao và chi trả |
| NFR-COMP-02 | Nhật ký bảo mật người dùng lưu tối thiểu theo chính sách nội bộ |
| NFR-COMP-03 | Dữ liệu cá nhân của nhân sự chỉ truy cập được bởi vai trò có quyền quản trị nhân sự |
