# Stage 1: Build the application
FROM oven/bun:1-alpine AS build

# --- KHAI BÁO ARG (Phải khớp chính xác với --build-arg trong Jenkins) ---
ARG APP_URL
ARG APP_TITLE
ARG API_ENDPOINT
ARG WS_URL
ARG APP_VERSION
ARG FIREBASE_VAPID_KEY
ARG FIREBASE_API_KEY
ARG FIREBASE_AUTH_DOMAIN
ARG FIREBASE_DATABASE_URL
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_STORAGE_BUCKET
ARG FIREBASE_MESSAGING_SENDER_ID
ARG FIREBASE_APP_ID
ARG FIREBASE_MEASUREMENT_ID
ARG TAURI_DEV_HOST

# --- GÁN VÀO ENV VỚI TIỀN TỐ VITE_ (Vite chỉ nhận biến có tiền tố này) ---
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

# Build dự án - Tại đây Vite sẽ nhúng các ENV vào file tĩnh
RUN bun run build && rm -rf node_modules

# Stage 2: Serve với Nginx
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]