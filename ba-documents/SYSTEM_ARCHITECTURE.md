# TÀI LIỆU KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

**Dự án:** Cadsquad Staff  
**Ngày cập nhật:** 28/05/2026  
**Trạng thái:** Bản nháp (Draft)

---

## 1. Tổng quan Kiến trúc (Architecture Overview)

Cadsquad Staff Platform được xây dựng dựa trên mô hình **Client-Server** hiện đại, kết hợp với các dịch vụ tích hợp bên ngoài để xử lý file và thông báo thời gian thực. Hệ thống được chia thành 3 cấu phần chính:

1. **Frontend (Client):** Ứng dụng Web / Desktop (Tauri).
2. **Backend (Server):** API Server cung cấp dữ liệu và xử lý nghiệp vụ.
3. **Third-party Services & Infrastructure:** Cơ sở dữ liệu, Cache, Storage (Sharepoint, Cloudinary), và Realtime Socket.

---

## 2. Công nghệ sử dụng (Technology Stack)

### 2.1. Frontend (Client)
- **Core Framework:** React 19, Vite.
- **Routing & State Management:** 
  - TanStack Router (quản lý điều hướng).
  - TanStack Query (quản lý state server, caching API).
  - TanStack Form / Zod (quản lý form và validation).
- **UI & Styling:**
  - Tailwind CSS v4, HeroUI, Radix UI, Ant Design (Antd).
  - Framer Motion (hiệu ứng chuyển động).
- **Desktop App:** Tauri (biến ứng dụng web thành ứng dụng desktop đa nền tảng).
- **Realtime & Services:** Firebase, Ably (cho thông báo và chat thời gian thực).

### 2.2. Backend (Server)
- **Core Framework:** NestJS 11 (Node.js).
- **Database ORM:** Prisma 7.
- **Cơ sở dữ liệu chính:** PostgreSQL.
- **Caching & Message Queue:** Redis, BullMQ (xử lý hàng đợi, email, push notification).
- **Xác thực (Authentication):** Better Auth, Passport Azure AD (tích hợp Microsoft/SSO), JWT.
- **Realtime:** Socket.io, Ably.
- **Tích hợp bên thứ ba:**
  - Microsoft Graph API (Quản lý thư mục, phân quyền Sharepoint).
  - Firebase Admin (Push Notifications).
  - Cloudinary (Lưu trữ ảnh/avatar).
  - Nodemailer (Gửi email).

### 2.3. Deployment & DevOps
- **Containerization:** Docker & Docker Compose (có các file cấu hình `docker-compose.yml`, `docker-compose.dev.yml`).
- **CI/CD:** Jenkins (qua file `Jenkinsfile`), Github Actions.

---

## 3. Sơ đồ luồng xử lý (Data Flow)

1. **Người dùng (Client) -> API Gateway (NestJS):** Request được xác thực thông qua JWT hoặc Session token.
2. **API Server -> Database (PostgreSQL):** Các thao tác CRUD dữ liệu cơ bản thông qua Prisma ORM.
3. **Upload File Dung lượng lớn (Micro-Service):** 
   - Yêu cầu upload file được đi qua hệ thống stream (Go stream service theo FRD hoặc luồng xử lý stream riêng) để đẩy thẳng lên Sharepoint thông qua Microsoft Graph API.
4. **Xử lý nền (Background Jobs):** 
   - Việc gửi email, thông báo (Notification), và đồng bộ dữ liệu nặng được đẩy vào **BullMQ (Redis)** để worker xử lý bất đồng bộ.

---

## 4. Các Module cốt lõi (Core Modules)

- **Auth & RBAC (Role-Based Access Control):** Hệ thống phân quyền chặt chẽ với Role và Permissions chi tiết (theo từng Action & Entity).
- **Job Management:** Quản lý công việc (Job), phân công (Assignment), trạng thái (Status Workflow) và luồng duyệt file (Delivery/Approval).
- **Financial Module:** Quản lý dòng tiền, đề xuất thanh toán, thông tin khách hàng, chi phí công việc.
- **Sharepoint Integration:** Quản lý tài liệu dự án trực tiếp trên Sharepoint, đồng bộ quyền truy cập.
- **Social / Community:** Module mạng xã hội nội bộ (Post, Comment, Gallery).
