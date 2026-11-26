// Works on Windows and Linux Jenkins agents.
// Needs on the Jenkins machine: Git, JDK 17, Maven, Node.js (configure Maven/JDK in Manage Jenkins > Tools if not on PATH).
def run(String cmd) {
  if (isUnix()) { sh cmd } else { bat cmd }
}

pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Unit tests') {
      steps { script { run('node --test') } }
    }
    stage('Maven build') {
      steps { script { run('mvn -B clean package -DskipNodeTests=true') } }
    }
    stage('Archive artifact') {
      steps { archiveArtifacts artifacts: 'target/*.war', fingerprint: true }
    }
  }

  post {
    success { echo 'Build succeeded.' }
    failure { echo 'Build failed.' }
  }
}
