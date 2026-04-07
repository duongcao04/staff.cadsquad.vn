pipeline {
    agent any

    options {
        skipDefaultCheckout() 
    }
    
    environment {
        DOCKER_USER = "haiduong004"
        BACKEND_IMAGE = "${DOCKER_USER}/csd-backend"
        CLIENT_IMAGE = "${DOCKER_USER}/csd-client"
        REGISTRY_CREDS = "docker-hub-creds"
        
        GITHUB_TOKEN = credentials('github-pat-token')
        GITHUB_OWNER = "duongcao04"
        GITHUB_REPO = "staff.cadsquad.vn"
        WORKFLOW_FILE = "main.yml"
        BRANCH = "master"

        // --- LOAD BIẾN TỪ FILE .ENV HOẶC ĐỊNH NGHĨA TRỰC TIẾP ---
        // Lưu ý: Nếu các biến này nhạy cảm, hãy dùng credentials('id')
        CLIENT_URL = "${env.CLIENT_URL ?: 'https://staff.cadsquad.vn'}"
        APP_TITLE  = "CSD Staff"
        BACKEND_URL = "${env.BACKEND_URL ?: 'https://api.staff.cadsquad.vn'}"
        WS_URL      = "${env.WS_URL ?: 'wss://api.staff.cadsquad.vn'}"
        APP_VERSION = "1.0.0"
        
        // Firebase & Other
        FIREBASE_VAPID_KEY = "${env.FIREBASE_VAPID_KEY}"
        FIREBASE_API_KEY   = "${env.FIREBASE_API_KEY}"
        FIREBASE_AUTH_DOMAIN = "${env.FIREBASE_AUTH_DOMAIN}"
        FIREBASE_DATABASE_URL = "${env.FIREBASE_DATABASE_URL}"
        FIREBASE_PROJECT_ID = "${env.FIREBASE_PROJECT_ID}"
        FIREBASE_STORAGE_BUCKET = "${env.FIREBASE_STORAGE_BUCKET}"
        FIREBASE_MESSAGING_SENDER_ID = "${env.FIREBASE_MESSAGING_SENDER_ID}"
        FIREBASE_APP_ID = "${env.FIREBASE_APP_ID}"
        FIREBASE_MEASUREMENT_ID = "${env.FIREBASE_MEASUREMENT_ID}"
        TAURI_DEV_HOST = "localhost"
    }

    stages {
        stage('Cleanup Workspace') {
            steps { cleanWs() }
        }

        stage('Checkout Code') {
            steps { checkout scm }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    docker.withRegistry('', REGISTRY_CREDS) {
                        // 1. Build & Push Backend
                        def backendApp = docker.build("${BACKEND_IMAGE}:latest", "./server")
                        backendApp.push()
                        backendApp.push("${env.BUILD_NUMBER}")

                        // 2. Build & Push Web Client (TRUYỀN ARG)
                        def clientBuildArgs = [
                            "--build-arg APP_URL=${CLIENT_URL}",
                            "--build-arg APP_TITLE=${APP_TITLE}",
                            "--build-arg API_ENDPOINT=${BACKEND_URL}",
                            "--build-arg WS_URL=${WS_URL}",
                            "--build-arg APP_VERSION=${APP_VERSION}",
                            "--build-arg FIREBASE_VAPID_KEY=${FIREBASE_VAPID_KEY}",
                            "--build-arg FIREBASE_API_KEY=${FIREBASE_API_KEY}",
                            "--build-arg FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}",
                            "--build-arg FIREBASE_DATABASE_URL=${FIREBASE_DATABASE_URL}",
                            "--build-arg FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}",
                            "--build-arg FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}",
                            "--build-arg FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}",
                            "--build-arg FIREBASE_APP_ID=${FIREBASE_APP_ID}",
                            "--build-arg FIREBASE_MEASUREMENT_ID=${FIREBASE_MEASUREMENT_ID}",
                            "--build-arg TAURI_DEV_HOST=${TAURI_DEV_HOST}"
                        ].join(" ")
                        
                        // Cấu trúc: docker.build("tên-image", "các-flag đường-dẫn-context")
                        def clientApp = docker.build("${CLIENT_IMAGE}:latest", "${clientBuildArgs} ./client")
                        clientApp.push()
                        clientApp.push("${env.BUILD_NUMBER}")
                    }
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    dir('/home/prod/apps/csd-staff') {
                        // Lưu ý: Lúc này Docker Compose chỉ làm nhiệm vụ chạy Image đã build sẵn
                        sh "cp ${WORKSPACE}/docker-compose.yml ." 
                        sh 'docker compose pull web_client backend'
                        sh 'docker compose up -d'
                    }
                }
            }
        }

        stage('Trigger GitHub Actions') {
            steps {
                script {
                    sh '''
                    curl -L \
                      -X POST \
                      -H "Accept: application/vnd.github+json" \
                      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                      https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches \
                      -d "{\\"ref\\":\\"${BRANCH}\\", \\"inputs\\": {\\"message\\": \\"Build #${BUILD_NUMBER} deployed!\\"}}"
                    '''
                }
            }
        }
    }

    post {
        success {
            sh 'docker image prune -f'
        }
    }
}