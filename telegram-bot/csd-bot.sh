#!/bin/bash

# ==========================================
# CẤU HÌNH CƠ BẢN
# ==========================================
TOKEN="8362976749:AAEYCnL26UBI9Pkey14yE1AzJNxP7m58ZaM"
ALLOWED_ID="1862066046"
OFFSET=0

echo "🤖 CSD Bash Bot đang chạy..."

# Vòng lặp vô hạn để nhận tin nhắn (Long-polling không tốn CPU)
while true; do
    # Gọi API Telegram chờ tin nhắn mới (timeout 60s)
    UPDATES=$(curl -s "https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${OFFSET}&timeout=60")
    
    # Kiểm tra xem có tin nhắn mới không
    UPDATE_COUNT=$(echo "$UPDATES" | jq '.result | length')

    if [[ "$UPDATE_COUNT" -gt 0 ]]; then
        for (( i=0; i<$UPDATE_COUNT; i++ )); do
            # Bóc tách thông tin tin nhắn
            UPDATE_ID=$(echo "$UPDATES" | jq -r ".result[$i].update_id")
            CHAT_ID=$(echo "$UPDATES" | jq -r ".result[$i].message.chat.id")
            TEXT=$(echo "$UPDATES" | jq -r ".result[$i].message.text")

            # CHỈ XỬ LÝ NẾU ĐÚNG CHAT ID CỦA BẠN (Bảo mật tuyệt đối)
            if [[ "$CHAT_ID" == "$ALLOWED_ID" ]]; then
                
                # ----------------------------------------
                # TÍNH NĂNG 1: LỆNH /ps (Xem danh sách Docker)
                # ----------------------------------------
                if [[ "$TEXT" == "/ps" ]]; then
                    OUTPUT=$(docker ps --format "table {{.Names}}\t{{.Status}}")
                    curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
                         -d "chat_id=${CHAT_ID}" --data-urlencode "text=🐳 Danh sách Docker:
$OUTPUT"
                # ----------------------------------------
                # TÍNH NĂNG 2: LỆNH /log (Xem log của container)
                # ----------------------------------------
                elif [[ "$TEXT" == /log* ]]; then
                    # Tách lấy phần chữ thứ 2 (tên container)
                    CONTAINER=$(echo "$TEXT" | awk '{print $2}')
                    
                    if [[ -n "$CONTAINER" ]]; then
                        # KIỂM TRA: Container có tồn tại không? (Dùng docker inspect giấu output)
                        if docker inspect "$CONTAINER" >/dev/null 2>&1; then
                            # NẾU TỒN TẠI -> Lấy 30 dòng log
                            LOGS=$(docker logs --tail 30 "$CONTAINER" 2>&1)
                            
                            # Xử lý trường hợp log rỗng
                            if [[ -z "${LOGS// /}" ]]; then
                                LOGS="ℹ️ Container hiện chưa có dòng log nào."
                            else
                                LOGS="${LOGS: -3900}" # Cắt bớt giữ lại 3900 ký tự cuối
                            fi
                            
                            curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
                                 -d "chat_id=${CHAT_ID}" --data-urlencode "text=📄 Log của $CONTAINER:
$LOGS"
                        else
                            # NẾU KHÔNG TỒN TẠI -> Báo lỗi Not Found
                            curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
                                 -d "chat_id=${CHAT_ID}" -d "text=❌ Lỗi (Not Found): Không tìm thấy container nào tên là '$CONTAINER'. Bạn gõ /ps để copy đúng tên nhé!"
                        fi
                    else
                        curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
                             -d "chat_id=${CHAT_ID}" -d "text=⚠️ Vui lòng nhập tên. VD: /log csd-staff-backend-1"
                    fi
                # ----------------------------------------
                # TÍNH NĂNG 3: LỆNH /sys (Kiểm tra sức khỏe VPS)
                # ----------------------------------------
                elif [[ "$TEXT" == "/sys" ]]; then
                    # Lấy thông tin RAM
                    RAM_INFO=$(free -m | awk 'NR==2{printf "%sMB / %sMB (%.2f%%)", $3, $2, $3*100/$2}')
                    
                    # Lấy thông tin Ổ cứng
                    DISK_INFO=$(df -h / | awk '$NF=="/"{printf "%s / %s (%s)", $3, $2, $5}')
                    
                    # Lấy Tải CPU (Load Average 1, 5, 15 phút)
                    CPU_LOAD=$(cat /proc/loadavg | awk '{print $1, $2, $3}')
                    
                    # Đóng gói tin nhắn
                    SYS_MSG="💻 *Tình trạng Server:*
🧠 *RAM:* $RAM_INFO
⚙️ *CPU Load:* $CPU_LOAD
💾 *Ổ cứng:* $DISK_INFO"

                    curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
                         -d "chat_id=${CHAT_ID}" -d "parse_mode=Markdown" \
                         --data-urlencode "text=$SYS_MSG"
                fi
            fi
            
            # Tăng Offset lên 1 để đánh dấu là "đã đọc" tin nhắn
            OFFSET=$((UPDATE_ID + 1))
        done
    fi
done