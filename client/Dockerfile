# Stage 1: Build the application
FROM oven/bun:1-alpine AS build

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