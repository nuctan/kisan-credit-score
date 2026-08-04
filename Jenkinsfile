pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io/nuctan'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/kisaanai-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/kisaanai-backend"
        BUILD_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/your-username/kisaanai.git'
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('ml_service') {
                    sh 'python3 -m venv venv'
                    sh './venv/bin/pip install -r requirements.txt'
                    sh './venv/bin/python -c "import main; print(\'Python Backend Syntax Check Passed!\')"'
                }
            }
        }

        stage('Build & Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend"
                    sh "docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} -t ${BACKEND_IMAGE}:latest ./ml_service"
                }
            }
        }

        stage('Push to Docker Registry') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                        sh "docker push ${FRONTEND_IMAGE}:${BUILD_TAG}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                        sh "docker push ${BACKEND_IMAGE}:${BUILD_TAG}"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes (K8s)') {
            steps {
                script {
                    sh "kubectl apply -f k8s/mongodb-deployment.yaml"
                    sh "kubectl apply -f k8s/backend-deployment.yaml"
                    sh "kubectl apply -f k8s/frontend-deployment.yaml"
                    sh "kubectl rollout restart deployment/kisaanai-backend"
                    sh "kubectl rollout restart deployment/kisaanai-frontend"
                }
            }
        }
    }

    post {
        success {
            echo '✅ KisanAI CI/CD Pipeline Completed Successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Please check Jenkins build console logs.'
        }
    }
}
