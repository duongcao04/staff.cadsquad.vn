# Stage 1: Build the application
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Tối ưu cache cho layer install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy TOÀN BỘ mã nguồn (Bao gồm cả file .env do GitHub Actions vừa đẻ ra)
COPY . .

# Build dự án - Tại đây Vite sẽ tự động tìm và đọc file .env
RUN bun run build && rm -rf node_modules

# Stage 2: Serve với Nginx
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]