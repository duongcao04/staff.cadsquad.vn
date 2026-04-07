pipeline {
    agent any

    options {
        // Jenkins không tự động checkout lần 2 gây lỗi
        skipDefaultCheckout() 
    }
    
    environment {
        // Cấu hình Image Docker
        DOCKER_USER = "haiduong004" // docker hub username
        BACKEND_IMAGE = "${DOCKER_USER}/csd-backend"
        CLIENT_IMAGE = "${DOCKER_USER}/csd-client"
        REGISTRY_CREDS = "docker-hub-creds"
        
        // --- PHẦN MỚI THÊM: Cấu hình GitHub Actions Trigger ---
        GITHUB_TOKEN = credentials('github-pat-token') // Phải tạo credential loại Secret Text tên 'github-pat-token' trong Jenkins
        GITHUB_OWNER = "duongcao04"
        GITHUB_REPO = "staff.cadsquad.vn"
        WORKFLOW_FILE = "main.yml"
        BRANCH = "master"
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs() // Tránh rác từ các bản build cũ làm đầy 40GB SSD
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm 
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    docker.withRegistry('', REGISTRY_CREDS) {
                        // 1. Build & Push Backend
                        def backendApp = docker.build("${BACKEND_IMAGE}:latest", "./server")
                        backendApp.push()
                        backendApp.push("${env.BUILD_NUMBER}")

                        // 2. Build & Push Web Client
                        def clientApp = docker.build("${CLIENT_IMAGE}:latest", "./client")
                        clientApp.push()
                        clientApp.push("${env.BUILD_NUMBER}")
                    }
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    // Nhảy vào thư mục chứa file .env trên VPS
                    dir('/home/prod/apps/csd-staff') {
                        // Copy file docker-compose.yml từ workspace Jenkins sang thư mục này
                        sh "cp ${WORKSPACE}/docker-compose.yml ." 

                        sh 'docker compose pull backend web_client'
                        sh 'docker compose up -d'
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                echo "Waiting for services to be healthy..."
                sleep 10
                sh 'docker ps'
            }
        }

        // --- PHẦN MỚI THÊM: Gọi API sang GitHub ---
        stage('Trigger GitHub Actions') {
            steps {
                script {
                    echo "Deploy xong! Đang bắn tín hiệu sang GitHub Actions..."
                    sh '''
                    curl -L \
                      -X POST \
                      -H "Accept: application/vnd.github+json" \
                      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                      -H "X-GitHub-Api-Version: 2022-11-28" \
                      https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches \
                      -d "{\\"ref\\":\\"${BRANCH}\\", \\"inputs\\": {\\"message\\": \\"App đã deploy xong với Build #${BUILD_NUMBER} trên Jenkins!\\"}}"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployment successful for build ${env.BUILD_NUMBER}!"
            // Xóa các image rác (dangling images) để tiết kiệm ổ cứng
            sh 'docker image prune -f'
        }
        failure {
            echo "Deployment failed! Check logs immediately."
        }
    }
}