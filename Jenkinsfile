pipeline {
    agent any

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
    }
}
