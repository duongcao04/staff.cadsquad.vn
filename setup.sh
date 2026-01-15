#!/bin/bash

# Màu sắc cho log đẹp hơn
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== BẮT ĐẦU CẤU HÌNH MÔI TRƯỜNG ===${NC}"

# 1. Tạo các thư mục dữ liệu (Data Directories)
echo -e "${GREEN}[1/3] Đang tạo cấu trúc thư mục...${NC}"

mkdir -p ./data/postgres
mkdir -p ./data/redis
mkdir -p ./data/pgadmin
mkdir -p ./data/grafana
mkdir -p ./data/npm           # Nginx Proxy Manager
mkdir -p ./monitoring/prometheus
mkdir -p ./monitoring/promtail # Nếu dùng Loki sau này

# 2. Xử lý phân quyền (Permission) - QUAN TRỌNG
echo -e "${GREEN}[2/3] Đang thiết lập quyền (Fix Permission Denied)...${NC}"

# Fix cho PgAdmin (Chạy dưới user ID 5050)
echo " -> Cấp quyền cho PgAdmin (UID 5050)"
sudo chown -R 5050:5050 ./data/pgadmin

# Fix cho Grafana (Chạy dưới user ID 472)
echo " -> Cấp quyền cho Grafana (UID 472)"
sudo chown -R 472:472 ./data/grafana

# Đảm bảo user hiện tại sở hữu các thư mục còn lại để dễ debug
sudo chown -R $USER:$USER ./monitoring
sudo chown -R $USER:$USER ./data/postgres
sudo chown -R $USER:$USER ./data/redis

# 3. Tạo file cấu hình Prometheus
echo -e "${GREEN}[3/3] Đang tạo file monitoring/prometheus/prometheus.yml...${NC}"

cat <<EOF > ./monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Uncomment phần dưới nếu Backend NestJS đã cài thư viện metrics
  # - job_name: 'nestjs-backend'
  #   metrics_path: '/metrics'
  #   static_configs:
  #     - targets: ['backend:3000']
EOF

echo -e "${BLUE}=== HOÀN TẤT! ===${NC}"
echo -e "Bây giờ bạn có thể chạy lệnh: ${GREEN}docker-compose up -d${NC}"