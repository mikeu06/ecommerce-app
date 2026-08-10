pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'

        ECR_REPOSITORY = '265751833968.dkr.ecr.us-east-1.amazonaws.com/ecommerce-backend'

        ECS_CLUSTER = 'ecommerce-cluster'
        ECS_SERVICE = 'backend-service'
        ECS_TASK_FAMILY = 'ecommerce-backend-task'
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
                    set -e

                    echo "Building Docker image..."

                    docker build \
                        -t ecommerce-backend:${BUILD_NUMBER} \
                        -t ecommerce-backend:latest \
                        ./backend

                    echo "Docker build completed successfully."
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

        stage('Deploy to ECS') {
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

                        echo "======================================"
                        echo "Starting ECS Deployment"
                        echo "======================================"

                        IMAGE_URI="${ECR_REPOSITORY}:${BUILD_NUMBER}"

                        echo "New image:"
                        echo "${IMAGE_URI}"

                        echo ""
                        echo "Getting current ECS task definition..."

                        aws ecs describe-task-definition \
                            --task-definition ${ECS_TASK_FAMILY} \
                            --region ${AWS_REGION} \
                            --query 'taskDefinition' \
                            --output json > task-definition.json

                        echo "Current task definition downloaded."

                        echo ""
                        echo "Preparing new task definition..."

                        jq 'del(
                            .taskDefinitionArn,
                            .revision,
                            .status,
                            .requiresAttributes,
                            .compatibilities,
                            .registeredAt,
                            .registeredBy
                        )' task-definition.json > new-task-definition.json

                        echo ""
                        echo "Updating container image..."

                        jq --arg IMAGE "${IMAGE_URI}" \
                            '.containerDefinitions[0].image = $IMAGE' \
                            new-task-definition.json \
                            > final-task-definition.json

                        echo ""
                        echo "New image configured as:"
                        
                        jq -r '.containerDefinitions[0].image' \
                            final-task-definition.json

                        echo ""
                        echo "Registering new ECS task definition..."

                        NEW_TASK_DEFINITION=$(aws ecs register-task-definition \
                            --cli-input-json file://final-task-definition.json \
                            --region ${AWS_REGION} \
                            --query 'taskDefinition.taskDefinitionArn' \
                            --output text)

                        echo ""
                        echo "New task definition:"
                        echo "${NEW_TASK_DEFINITION}"

                        echo ""
                        echo "Updating ECS service..."

                        aws ecs update-service \
                            --cluster ${ECS_CLUSTER} \
                            --service ${ECS_SERVICE} \
                            --task-definition ${NEW_TASK_DEFINITION} \
                            --region ${AWS_REGION} \
                            --output json > ecs-update.json

                        echo ""
                        echo "ECS service update submitted."

                        echo ""
                        echo "Waiting for ECS service to become stable..."

                        aws ecs wait services-stable \
                            --cluster ${ECS_CLUSTER} \
                            --services ${ECS_SERVICE} \
                            --region ${AWS_REGION}

                        echo ""
                        echo "======================================"
                        echo "ECS Deployment Successful"
                        echo "======================================"

                        echo ""
                        echo "Service status:"

                        aws ecs describe-services \
                            --cluster ${ECS_CLUSTER} \
                            --services ${ECS_SERVICE} \
                            --region ${AWS_REGION} \
                            --query 'services[0].{Desired:desiredCount,Running:runningCount,Pending:pendingCount,TaskDefinition:taskDefinition}' \
                            --output table
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
                rm -f task-definition.json
                rm -f new-task-definition.json
                rm -f final-task-definition.json
                rm -f ecs-update.json
            '''
        }
    }
}
