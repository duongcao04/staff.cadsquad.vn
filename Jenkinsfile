pipeline {
    agent any

    environment {
        // Cấu hình Image cho từng service
        DOCKER_USER = "haiduong004" // docker hub username
        BACKEND_IMAGE = "${DOCKER_USER}/csd-backend"
        CLIENT_IMAGE = "${DOCKER_USER}/csd-client"
        REGISTRY_CREDS = "docker-hub-creds"
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs() // Tránh rác từ các bản build cũ làm đầy 40GB SSD
            }
        }

        stage('Checkout Code') {
            steps {
                // Pull code từ repo GitHub
                git branch: 'master', credentialsId: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJMpT8HOV0nYTSjxpV1xs/iQlNfhwZiUFDbM0SYqWJGp caohaiduong04@gmail.com', url: 'git@github.com:duongcao04/staff.cadsquad.vn.git'
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    docker.withRegistry('', REGISTRY_CREDS) {
                        // 1. Build & Push Backend
                        // Chú ý: Dùng --no-cache nếu bạn muốn build sạch hoàn toàn
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
                    // Vì Jenkins chạy ngay trên VPS này, ta gọi trực tiếp docker compose
                    // pull giúp lấy image mới nhất từ Registry về trước khi restart
                    sh 'docker compose pull backend web_client'
                    sh 'docker compose up -d'
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