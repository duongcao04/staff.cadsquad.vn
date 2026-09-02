---
icon: lucide/clipboard-check
---

# Kiểm tra chất lượng — Checklist 20 điểm

Mọi use case đã đặc tả đều được đối chiếu với checklist 20 điểm chuẩn trước khi bàn giao.
Chú giải: ✅ đạt · ⚠️ cần một quyết định nghiệp vụ · ❌ không đạt.

## 1. Kết quả kiểm tra

| Mục | Nội dung kiểm tra | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| **C1** | Tên UC theo dạng "động từ + đối tượng", chủ động | ✅ | Cả 31 tên đều mở đầu bằng động từ hành động ("Tạo job", "Quyết định nghiệm thu deliverable"). Các động từ mơ hồ đã bị loại: "Quản lý job" được tách thành UC-JOB-01…13. |
| **C2** | Ở user-goal level, vượt qua coffee-break test | ⚠️ | 29 trên 31 đạt. UC-AUTH-04 và UC-DOC-01 cố ý ở mức sub-function, đã được đánh dấu rõ và chỉ truy cập được qua `Includes`. |
| **C3** | Mã UC duy nhất và đúng quy ước đặt tên | ✅ | Định dạng `UC-<phân hệ>-<số thứ tự>` trên 9 phân hệ; cả 60 mã trong danh mục đều duy nhất. |
| **C4** | Đúng 1 primary actor và 1 mục tiêu nghiệp vụ | ⚠️ | UC-JOB-05 liệt kê cả Nhân sự và Quản lý dự án là primary. Hai vai này theo đuổi cùng một mục tiêu qua cùng một luồng, chỉ khác ở việc role nào được phép đặt trạng thái đích nào. Đưa ra để xác nhận thay vì tách đôi. |
| **C5** | Ranh giới hệ thống rõ ràng | ✅ | Nền tảng là hệ thống xuyên suốt; SharePoint, Entra ID, Ably, Firebase, SMTP và Cloudinary chỉ xuất hiện với vai trò secondary actor. |
| **C6** | Actor là vai trò cụ thể, không phải "người dùng" | ✅ | Bảy vai trò người có tên cụ thể và bảy actor hệ thống có tên cụ thể; không chỗ nào dùng "người dùng" làm actor. |
| **C7** | Description nêu đủ VÌ SAO + LÀM GÌ + KẾT QUẢ | ✅ | Mỗi description được viết theo đúng thứ tự đó, với ba phần được đánh dấu tường minh trong văn bản. |
| **C8** | Tần suất sử dụng được định lượng | ⚠️ | Cả 31 UC đều có con số, nhưng mọi con số đều suy ra từ giả định AS-F1 (~50 nhân sự, ~200 job/tháng) chứ không phải từ số liệu đo thực tế. Cần đối chiếu với sản lượng thực trước khi xây dựng. |
| **C9** | Precondition kiểm chứng được | ✅ | Mỗi precondition là một phép kiểm tra đúng/sai trên trạng thái hệ thống (có permission, bản ghi tồn tại, trạng thái chưa kết thúc). Không có điều kiện mang tính động cơ hay không kiểm chứng được. |
| **C10** | Postcondition bao phủ trạng thái thành công và mọi thay đổi hệ thống | ✅ | Mỗi bộ postcondition bao gồm bản ghi chính, vết audit, thông báo và thay đổi về khả năng nhìn thấy. |
| **C11** | Không nhầm precondition với assumption | ✅ | Điều kiện cưỡng chế được nằm ở Preconditions; niềm tin chưa kiểm chứng (đối soát ngân hàng bên ngoài, việc cấp tài khoản Microsoft 365) nằm ở Assumptions. |
| **C12** | Danh sách đánh số, mỗi bước một hành động | ✅ | Các bước đều đơn hành động; những bước ghép kiểu "nhập chủ đề rồi bấm Xác nhận" đã được tách ra. |
| **C13** | Luân phiên Actor và Hệ thống, chủ ngữ tường minh | ✅ | Mọi bước đều mở đầu bằng một chủ ngữ có tên; không còn bước bị động hay thiếu chủ ngữ. |
| **C14** | Không nhúng if/else hay vòng lặp trong Normal Course | ✅ | Mọi rẽ nhánh nằm ở Alternative Courses; mọi rẽ nhánh do lỗi nằm ở Exceptions. |
| **C15** | Luồng chạy từ điểm kích hoạt tới postcondition, không có bước lơ lửng | ✅ | Mỗi Normal Course kết thúc bằng một phản hồi của hệ thống thoả mãn đúng các postcondition đã nêu. |
| **C16** | Mỗi AC nêu rõ "tại bước N" kèm điều kiện | ✅ | Cả 73 alternative course đều nêu bước rẽ nhánh, điều kiện và điểm quay lại luồng chính. |
| **C17** | Mỗi Exception có kích hoạt, phản hồi và trạng thái cuối | ✅ | Cả 153 exception đều có đủ ba phần một cách tường minh. |
| **C18** | Bao phủ các dạng thất bại thường gặp | ✅ | Từ chối vì thiếu quyền, xung đột do thao tác đồng thời, hết thời gian chờ dịch vụ ngoài, dữ liệu nhập không hợp lệ, thất bại một phần và xung đột dữ liệu cũ đều xuất hiện trong bộ UC. Các UC tài chính bổ sung thêm tính nguyên tử và lỗi trùng số tham chiếu. |
| **C19** | Includes trỏ tới use case có thật | ✅ | Cả 12 tham chiếu `Includes` trên 9 use case đều giải quyết được: UC-AUTH-04, UC-JOB-02, UC-JOB-05, UC-RBAC-03, UC-CLI-01, UC-FIN-01, UC-DOC-01, UC-DOC-02. |
| **C20** | Special Requirements không lặp lại yêu cầu chức năng | ✅ | Special Requirements chỉ chứa ràng buộc về hiệu năng, bảo mật, tính nguyên tử, lưu trữ và truy vết, mỗi mục đều truy được về một NFR trong BRD. |

**Kết luận: 17 mục đạt, 3 mục cần quyết định nghiệp vụ, 0 mục không đạt.**

## 2. Các mục cần quyết định

| Mục | Câu hỏi | Người quyết định | Khuyến nghị |
| --- | --- | --- | --- |
| C2 | UC-AUTH-04 và UC-DOC-01 có được chấp nhận ở mức sub-function không? | BA lead | Giữ nguyên. Cả hai đều mã hoá hành vi xử lý thất bại mà nếu gộp vào use case cha thì sẽ bị chôn vùi, và cả hai đều được nhiều use case khác gọi lại. |
| C4 | UC-JOB-05 có nên tách theo actor không? | Vận hành | Không nên tách. Luồng giống hệt nhau; khác biệt được thể hiện qua danh sách role được phép của trạng thái đích, vốn là cấu hình chứ không phải một mục tiêu riêng. |
| C8 | Các con số tần suất có sát thực tế không? | Vận hành | Thay giả định AS-F1 bằng sản lượng đo được từ hệ thống hiện tại trước khi bắt đầu xây dựng; mọi con số trong danh mục đều suy ra từ cùng một cơ sở nên sẽ cập nhật đồng bộ. |

## 3. Độ bao phủ so với BRD

| Nhóm yêu cầu BRD | Được phủ bởi | Mức bao phủ |
| --- | --- | --- |
| BR-AUTH-01…07 | UC-AUTH-01…07 | Đã đặc tả: 01, 02, 03, 04, 05. Mới ở danh mục: 06, 07. |
| BR-RBAC-01…06 | UC-RBAC-01…04 | Đã đặc tả: 01, 02, 03. Mới ở danh mục: 04. |
| BR-JOB-01…17 | UC-JOB-01…15 | Đã đặc tả: 01, 02, 03, 05, 08, 09, 13. Mới ở danh mục: 8 UC còn lại. |
| BR-DLV-01…05 | UC-DLV-01…03 | Đã đặc tả: 01, 02. Mới ở danh mục: 03. |
| BR-CFG-01…07 | UC-CFG-01…05 | Đã đặc tả: 01, 03. Mới ở danh mục: 02, 04, 05. |
| BR-CLI-01…04 | UC-CLI-01…02 | Đã đặc tả: 01. Mới ở danh mục: 02. |
| BR-FIN-01…10 | UC-FIN-01…07 | Đã đặc tả: 01, 02, 03. Mới ở danh mục: 04, 05, 06, 07. |
| BR-HR-01…06 | UC-HR-01…07 | Đã đặc tả: 01, 02. Mới ở danh mục: 5 UC còn lại. |
| BR-WS-01…06 | UC-ANA-01, UC-NOT-02, UC-HR-05 | Đã đặc tả: UC-ANA-01. Mới ở danh mục: phần còn lại. |
| BR-ANA-01…06 | UC-ANA-01…04 | Đã đặc tả: 01. Mới ở danh mục: 02, 03, 04. |
| Luồng thông báo & nhắc việc (BRD §5) | UC-NOT-01…02 | Đã đặc tả: 01 (nhắc deadline). Mới ở danh mục: 02. |
| BR-DOC-01…07 | UC-DOC-01…05 | Đã đặc tả: 01, 02, 03. Mới ở danh mục: 04, 05. |
| BR-COM-01…05 | UC-COM-01…04 | Mới ở mức danh mục — ưu tiên thấp cho phiên bản này. |
| BR-SYS-01…06 | UC-SYS-01…03 | Đã đặc tả: 01. Mới ở danh mục: 02, 03. Giám sát tình trạng dịch vụ (BR-SYS-06) là vấn đề vận hành, không phải use case. |

**Ghi chú về khoảng trống:** BR-SYS-05 (trung tâm trợ giúp) và BR-SYS-06 (giám sát tình
trạng dịch vụ và dashboard hàng đợi) không sinh ra use case nào ở user-goal level. Cái thứ
nhất là nội dung tĩnh, cái thứ hai là năng lực vận hành đã được phủ bởi NFR-OPS-01…03. Cả
hai được cố ý để ngoài danh mục.

## 4. Tổng hợp các mục còn để mở

Toàn bộ 58 mục `[TBD-n]` nằm trong chính use case của chúng. Những mục chặn nhiều hơn một
use case gồm:

| TBD | Câu hỏi | Chặn | Người quyết định | Hạn |
| --- | --- | --- | --- | --- |
| TBD-16 | Quy tắc đánh mã job và việc dùng lại mã sau khi xoá | UC-JOB-01, UC-DOC-01 | Vận hành | Trước Đợt 1 |
| TBD-36 | Quy tắc đủ điều kiện payout BR-FIN-001 — client có bắt buộc phải thanh toán trước không? | UC-FIN-02, UC-JOB-03, UC-HR-02 | Kế toán | Trước Đợt 1 |
| TBD-32 | Delivery bị từ chối thì job quay về trạng thái làm việc nào | UC-DLV-02, UC-JOB-05, UC-CFG-01 | Vận hành | Trước Đợt 1 |
| TBD-25 | Chuẩn tính KPI đúng hạn — ngày đến hạn gốc hay ngày mới nhất | UC-JOB-09, UC-ANA-02 | Ban Điều hành | Trước Đợt 3 |
| TBD-57 | Thời gian lưu trữ audit log | UC-SYS-01, UC-AUTH-01 | Ban Điều hành | Trước Đợt 2 |

---
*Đặc tả Use Case được xây dựng bằng skill `use-case-writer` của **Phúc NT** · BA Zone · Digital School.*
