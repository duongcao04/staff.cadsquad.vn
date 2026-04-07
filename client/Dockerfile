# Stage 1: Build the application
FROM oven/bun:1-alpine AS build

# Khai báo các ARG
ARG VITE_APP_URL
ARG VITE_APP_TITLE
ARG VITE_API_ENDPOINT
ARG VITE_WS_URL
ARG VITE_FIREBASE_VAPID_KEY
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_DATABASE_URL
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_APP_VERSION

# Sử dụng ngoặc kép cho ENV để tránh lỗi ký tự đặc biệt/identifier
ENV VITE_APP_URL="${APP_URL}" \
    VITE_APP_TITLE="${APP_TITLE}" \
    VITE_API_ENDPOINT="${API_ENDPOINT}" \
    VITE_WS_URL="${WS_URL}" \
    VITE_APP_VERSION="${APP_VERSION}" \
    VITE_FIREBASE_VAPID_KEY="${FIREBASE_VAPID_KEY}" \
    VITE_FIREBASE_API_KEY="${FIREBASE_API_KEY}" \
    VITE_FIREBASE_AUTH_DOMAIN="${FIREBASE_AUTH_DOMAIN}" \
    VITE_FIREBASE_DATABASE_URL="${FIREBASE_DATABASE_URL}" \
    VITE_FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID}" \
    VITE_FIREBASE_STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET}" \
    VITE_FIREBASE_MESSAGING_SENDER_ID="${FIREBASE_MESSAGING_SENDER_ID}" \
    VITE_FIREBASE_APP_ID="${FIREBASE_APP_ID}" \
    VITE_FIREBASE_MEASUREMENT_ID="${FIREBASE_MEASUREMENT_ID}" \
    TAURI_DEV_HOST="${TAURI_DEV_HOST}"

WORKDIR /app

# Tối ưu cache cho layer install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy mã nguồn
COPY . .

# Build dự án
RUN bun run build && \
    # XÓA node_modules ngay sau khi build để giải phóng dung lượng đĩa tạm thời trong quá trình build
    rm -rf node_modules

# Stage 2: Serve với Nginx
FROM nginx:stable-alpine

# Xóa các file mặc định của Nginx để tránh xung đột
RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Chỉ copy những file tĩnh đã được build (rất nhẹ)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]