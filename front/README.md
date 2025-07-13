# SecureNet FL - Frontend

이 문서는 SecureNet FL 프로젝트의 프론트엔드 애플리케이션에 대한 배포 가이드를 제공합니다.

## 📝 개요

-   **프레임워크**: Vite, React, TypeScript
-   **스타일링**: Tailwind CSS
-   **배포**: Docker 컨테이너 (Nginx 기반)

프론트엔드 애플리케이션은 Docker를 통해 Nginx 웹 서버 환경에서 정적 파일(HTML, CSS, JS)로 서빙됩니다. 모든 서비스(프론트엔드, API, AI 데모)는 프로젝트 루트의 `docker-compose.yml` 파일을 통해 한 번에 관리됩니다.

## 🚀 배포 방법

### 사전 요구사항

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (Docker Desktop에 포함)

### 배포 절차 (EC2 등 서버 환경 기준)

1.  **프로젝트 클론 또는 업데이트**
    ```bash
    # 최초 배포 시
    git clone <your-repository-url>

    # 이후 업데이트 시
    cd securenet-fl-mvp
    git pull
    ```

2.  **로그 디렉토리 생성 (최초 1회)**
    프로젝트 루트 디렉토리에서 연합학습 데모 로그를 저장할 `logs` 디렉토리를 생성합니다.
    ```bash
    mkdir logs
    ```

3.  **Docker Compose 실행**
    프로젝트 **루트 디렉토리**에서 다음 명령어를 실행하여 모든 서비스를 시작합니다. 이 명령어는 `front/Dockerfile`을 사용해 프론트엔드 이미지를 빌드하고, 컨테이너를 실행합니다.

    ```bash
    docker compose up --build -d frontend
    ```
    -   `--build`: 소스 코드 변경 시 이미지를 새로 빌드합니다.
    -   `-d`: 컨테이너를 백그라운드에서 실행합니다.

4.  **서버 방화벽/보안 그룹 설정**
    서버(예: AWS EC2)의 방화벽 또는 보안 그룹에서 **80번 포트**에 대한 인바운드(Inbound) 트래픽을 허용해야 합니다.

5.  **접속 확인**
    웹 브라우저에서 서버의 공인 IP 주소(`http://<서버_IP_주소>`)로 접속하여 애플리케이션을 확인합니다.

## 🔧 로컬 개발 환경

로컬에서 프론트엔드만 독립적으로 실행하려면 `front` 디렉토리에서 다음 명령어를 실행하세요.

1.  **의존성 설치**
    ```bash
    npm install
    ```

2.  **개발 서버 실행**
    ```bash
    npm run dev
    ```
    이후 터미널에 안내된 주소(보통 `http://localhost:5173`)로 접속합니다. 