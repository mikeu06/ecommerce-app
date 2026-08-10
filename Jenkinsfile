pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPOSITORY = '265751833968.dkr.ecr.us-east-1.amazonaws.com/ecommerce-backend'
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Verify Repository') {
            steps {
                sh '''
                    echo "Workspace:"
                    pwd

                    echo ""
                    echo "Repository Files:"
                    ls -la

                    echo ""
                    echo "Backend:"
                    ls -la backend

                    echo ""
                    echo "Frontend:"
                    ls -la frontend
                '''
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                        -t ecommerce-backend:${BUILD_NUMBER} \
                        -t ecommerce-backend:latest \
                        ./backend
                '''
            }
        }

        stage('Push Image to ECR') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh '''
                        set -e

                        echo "Logging in to Amazon ECR..."

                        aws ecr get-login-password \
                            --region ${AWS_REGION} | \
                            docker login \
                            --username AWS \
                            --password-stdin ${ECR_REPOSITORY}

                        echo "Tagging Docker image..."

                        docker tag \
                            ecommerce-backend:${BUILD_NUMBER} \
                            ${ECR_REPOSITORY}:${BUILD_NUMBER}

                        docker tag \
                            ecommerce-backend:${BUILD_NUMBER} \
                            ${ECR_REPOSITORY}:latest

                        echo "Pushing build ${BUILD_NUMBER}..."

                        docker push \
                            ${ECR_REPOSITORY}:${BUILD_NUMBER}

                        echo "Pushing latest..."

                        docker push \
                            ${ECR_REPOSITORY}:latest

                        echo "ECR push completed successfully."
                    '''
                }
            }
        }
    }
}
