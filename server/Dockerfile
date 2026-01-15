# Stage 0: base - Sử dụng bản slim chuẩn của Bun (Debian-based)
FROM oven/bun:1-slim AS base
WORKDIR /app

# Cài đặt thư viện hệ thống cần thiết (Dùng cho Prisma và kết nối Postgres)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    libsqlite3-dev \
    postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Stage 1: deps - Cài đặt thư viện Node.js
FROM base AS deps
COPY package.json bun.lock bun.lockb* ./
# Copy Prisma schema để chuẩn bị generate client
COPY ./src/providers/prisma/schema.prisma ./prisma/schema.prisma
COPY ./database ./database
RUN bun install --frozen-lockfile

# Stage 2: builder - Build mã nguồn TypeScript
FROM deps AS builder
COPY . .
RUN bun run build

# TỐI ƯU: Xóa node_modules cũ và chỉ cài lại bản Production để giảm dung lượng
RUN bun install --frozen-lockfile --production
# Tạo Prisma Client cho môi trường chạy thực tế
RUN bunx prisma generate

# Stage 3: runner - Môi trường Production cuối cùng
FROM base AS runner
WORKDIR /app

# Tạo User và Group theo chuẩn Debian
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nodejs

# 1. Node modules (đã tối ưu ở builder)
COPY --from=builder /app/node_modules ./node_modules
# 2. Mã nguồn đã biên dịch (Code chạy thực tế nằm ở đây)
COPY --from=builder /app/dist ./dist
# 3. File cấu hình package
COPY --from=builder /app/package.json ./
# 4. Prisma schema (cần thiết cho runtime nếu dùng prisma client)
COPY --from=builder /app/prisma ./prisma
# 5. Database (nếu dùng sqlite hoặc file seed)
COPY --from=builder /app/database ./database
# 7. Mail templates
COPY --from=builder /app/src/templates /app/src/templates

# # Copy và xử lý Entrypoint script
# COPY --chown=nodejs:nodejs ./entrypoint.sh ./
# # Sửa định dạng file (CRLF to LF) và cấp quyền thực thi
# RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x ./entrypoint.sh

# Phân quyền thư mục cho user không có quyền root (Bảo mật)
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080
ENV NODE_ENV production

# Entrypoint chạy migration trước, CMD khởi động Server sau
# ENTRYPOINT ["sh", "./entrypoint.sh"]
CMD ["bun", "dist/src/main.js"]