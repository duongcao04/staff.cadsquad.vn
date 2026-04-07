pipeline {
    agent any

    options {
        // Tránh xung đột dữ liệu cũ
        skipDefaultCheckout() 
    }
    
    environment {
        // Cấu hình Docker Hub
        DOCKER_USER = "haiduong004"
        BACKEND_IMAGE = "${DOCKER_USER}/csd-backend"
        CLIENT_IMAGE = "${DOCKER_USER}/csd-client"
        REGISTRY_CREDS = "docker-hub-creds"
        
        // Cấu hình GitHub Trigger
        GITHUB_TOKEN = credentials('github-pat-token')
        GITHUB_OWNER = "duongcao04"
        GITHUB_REPO = "staff.cadsquad.vn"
        WORKFLOW_FILE = "main.yml"
        BRANCH = "master"

        // --- BIẾN MÔI TRƯỜNG CHO CLIENT (VITE) ---
        // Sử dụng toán tử ?: '' để đảm bảo nếu biến thiếu sẽ là chuỗi rỗng thay vì chữ "null"
        CLIENT_URL = "${env.CLIENT_URL ?: 'https://staff.cadsquad.vn'}"
        APP_TITLE  = "CSD Staff"
        BACKEND_URL = "${env.BACKEND_URL ?: 'https://api.staff.cadsquad.vn'}"
        WS_URL      = "${env.WS_URL ?: 'wss://api.staff.cadsquad.vn'}"
        APP_VERSION = "1.0.0"
        
        // Firebase Configuration
        FIREBASE_VAPID_KEY = "${env.FIREBASE_VAPID_KEY ?: ''}"
        FIREBASE_API_KEY   = "${env.FIREBASE_API_KEY ?: ''}"
        FIREBASE_AUTH_DOMAIN = "${env.FIREBASE_AUTH_DOMAIN ?: ''}"
        FIREBASE_DATABASE_URL = "${env.FIREBASE_DATABASE_URL ?: ''}"
        FIREBASE_PROJECT_ID = "${env.FIREBASE_PROJECT_ID ?: ''}"
        FIREBASE_STORAGE_BUCKET = "${env.FIREBASE_STORAGE_BUCKET ?: ''}"
        FIREBASE_MESSAGING_SENDER_ID = "${env.FIREBASE_MESSAGING_SENDER_ID ?: ''}"
        FIREBASE_APP_ID = "${env.FIREBASE_APP_ID ?: ''}"
        FIREBASE_MEASUREMENT_ID = "${env.FIREBASE_MEASUREMENT_ID ?: ''}"
        TAURI_DEV_HOST = "localhost"
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm 
            }
        }

        stage('Check Env') {
            steps {
                // Lệnh kiểm tra env Jenkins
                sh "echo 'Building with URL: ${env.CLIENT_URL}'"
                sh "echo 'Building with URL: ${env.BACKEND_URL}'"
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    docker.withRegistry('', REGISTRY_CREDS) {
                        
                        // 1. Build & Push Backend (Simple Build)
                        sh "docker build --no-cache -t ${BACKEND_IMAGE}:latest ./server"
                        sh "docker push ${BACKEND_IMAGE}:latest"

                        // 2. Build & Push Web Client (Complex Build with ARGS)
                        // Sử dụng dấu nháy đơn nội bộ để bảo vệ các giá trị có khoảng trắng
                        sh """
                        docker build --no-cache -t ${CLIENT_IMAGE}:latest \
                            --build-arg APP_URL='${env.CLIENT_URL}' \
                            --build-arg APP_TITLE='${env.APP_TITLE}' \
                            --build-arg API_ENDPOINT='${env.BACKEND_URL}' \
                            --build-arg WS_URL='${env.WS_URL}' \
                            --build-arg APP_VERSION='${env.APP_VERSION}' \
                            --build-arg FIREBASE_VAPID_KEY='${env.FIREBASE_VAPID_KEY}' \
                            --build-arg FIREBASE_API_KEY='${env.FIREBASE_API_KEY}' \
                            --build-arg FIREBASE_AUTH_DOMAIN='${env.FIREBASE_AUTH_DOMAIN}' \
                            --build-arg FIREBASE_DATABASE_URL='${env.FIREBASE_DATABASE_URL}' \
                            --build-arg FIREBASE_PROJECT_ID='${env.FIREBASE_PROJECT_ID}' \
                            --build-arg FIREBASE_STORAGE_BUCKET='${env.FIREBASE_STORAGE_BUCKET}' \
                            --build-arg FIREBASE_MESSAGING_SENDER_ID='${env.FIREBASE_MESSAGING_SENDER_ID}' \
                            --build-arg FIREBASE_APP_ID='${env.FIREBASE_APP_ID}' \
                            --build-arg FIREBASE_MEASUREMENT_ID='${env.FIREBASE_MEASUREMENT_ID}' \
                            --build-arg TAURI_DEV_HOST='${env.TAURI_DEV_HOST}' \
                            ./client
                        """
                        
                        // Push tag latest và tag số build
                        sh "docker push ${CLIENT_IMAGE}:latest"
                        sh "docker tag ${CLIENT_IMAGE}:latest ${CLIENT_IMAGE}:${env.BUILD_NUMBER}"
                        sh "docker push ${CLIENT_IMAGE}:${env.BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    // Thư mục chứa docker-compose.yml trên máy chủ chạy Jenkins/Worker
                    dir('/home/prod/apps/csd-staff') {
                        // Cập nhật file compose mới nhất từ source code
                        sh "cp ${WORKSPACE}/docker-compose.yml ." 

                        // Kéo image mới về và khởi động lại
                        sh 'docker compose pull web_client backend'

                        // Down và Up lại để re-create container với image vừa pull
                        sh 'docker compose up -d --force-recreate'
                    }
                }
            }
        }

        stage('Trigger GitHub Actions') {
            steps {
                script {
                    echo "Deploy completed. Notifying GitHub..."
                    sh '''
                    curl -L \
                      -X POST \
                      -H "Accept: application/vnd.github+json" \
                      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                      https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches \
                      -d "{\\"ref\\":\\"${BRANCH}\\", \\"inputs\\": {\\"message\\": \\"Build #${BUILD_NUMBER} deployed successfully!\\"}}"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Success!"
            // Xóa image cũ (dangling) để tránh rác
            sh 'docker image prune -f'
        }
        failure {
            echo "Failed! Please check the logs above."
        }
    }
}