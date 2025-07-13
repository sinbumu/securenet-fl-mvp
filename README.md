# SecureNet-FL MVP

Federated Learning (연합 학습) 기반 실시간 금융 이상 거래 탐지 시스템 MVP 프로젝트입니다.

## 프로젝트 개요

SecureNet-FL은 다수의 금융 기관(은행)이 각자의 데이터를 외부에 노출하지 않으면서도, 모두의 데이터를 함께 학습하여 더욱 강력한 사기 탐지 AI 모델을 만드는 것을 목표로 합니다. 이 프로젝트는 연합 학습의 개념을 증명하고 실제 적용 가능성을 보여주기 위한 핵심 기능(MVP)을 구현합니다.

## 프로젝트 구조

```
.
├── ai/               # AI 모델 학습 및 평가 관련 모든 코드와 산출물
│   ├── ai_logs/      # 연합 학습 컨테이너 로그 (데모용)
│   ├── client.py     # 연합 학습 클라이언트 (은행)
│   ├── server.py     # 연합 학습 서버
│   ├── global_model.bin # 최종 학습된 XGBoost 모델
│   ├── evaluate_model.py # 모델 성능 평가 스크립트
│   └── README.md     # AI 모델 개발 상세 히스토리
├── api/              # (예정) 예측 API 서버 코드
├── data/             # 학습 및 평가용 데이터
├── docker-compose.yml # 연합 학습 환경 실행을 위한 Docker Compose 설정
└── README.md         # 프로젝트 전체 개요 및 가이드
```

## 개발 단계

### 1단계: AI 모델 개발 (완료)

연합 학습을 통해 고성능 사기 탐지 모델을 개발하는 단계입니다.

- **핵심 성과**:
  - 3개의 클라이언트가 참여하는 연합 학습 환경을 성공적으로 구축했습니다.
  - 극심한 데이터 불균형 문제를 `scale_pos_weight` 파라미터로 해결하여, **실제 사기 거래의 99.8%를 탐지**해내는 고성능 XGBoost 모델(`global_model.bin`)을 개발했습니다.
- **상세 내용**: 모델 개발 과정에서 발생했던 기술적 이슈와 해결 과정은 [ai/README.md](ai/README.md)에서 자세히 확인하실 수 있습니다.

### 2단계: 예측 API 서버 개발 (진행 예정)

개발된 AI 모델을 실제 서비스에서 사용할 수 있도록 API 형태로 제공하는 단계입니다.

- **목표**: `global_model.bin`을 탑재하여, 실시간으로 거래 데이터의 사기 위험도를 예측하는 API 서버를 구축합니다.
- **기술 스택**: `Python 3.9+`, `FastAPI`, `XGBoost`
- **주요 기능**:
  - `POST /risk-score` 엔드포인트를 통해 거래 정보를 JSON 형태로 입력받습니다.
  - 입력된 데이터를 전처리하고, 로드된 XGBoost 모델로 예측을 수행합니다.
  - 예측된 사기 확률을 `{"riskScore": 98.75}` 와 같은 형태의 JSON으로 반환합니다.

### 3단계: API 서버 배포 (AWS EC2)

개발된 API 서버를 클라우드 환경에 배포하여 안정적으로 운영하고, 외부에서 접근 가능하도록 하는 단계입니다.

#### 1. EC2 인스턴스 준비

- **추천 사양**: `t3.micro` (vCPU 2, 1 GiB Memory) - AWS 프리티어에 포함되어 비용 효율적입니다.
- **운영체제(AMI)**: Amazon Linux 2 또는 Ubuntu
- **보안 그룹**: 인바운드 규칙에 **8000번 포트**를 추가하여 API 서버에 접근할 수 있도록 허용해야 합니다.

#### 2. 서버 환경 구축 (EC2 인스턴스 접속 후)

EC2 인스턴스에 접속하여 API 서버 실행에 필요한 Git, Docker, Docker Compose를 설치합니다. (Amazon Linux 2 기준)

```bash
# 시스템 패키지 업데이트
sudo yum update -y

# Git 설치
sudo yum install git -y

# Docker 설치 및 실행
sudo yum install docker -y
sudo systemctl start docker

# ec2-user가 sudo 없이 docker 명령을 사용하도록 권한 추가
sudo usermod -a -G docker ec2-user

# --- 중요 ---
# 권한 적용을 위해 터미널에서 나갔다가 다시 접속해야 합니다.
# exit

# (재접속 후) Docker Compose v2 설치
# yum 으로 설치 시, 일부 환경에서 패키지를 찾지 못하는 경우가 있어 curl 로 직접 설치합니다.
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose


# 설치 확인
docker --version
docker compose version
```

#### 3. 소스코드 배포

- **배포 키(Deploy Key) 사용 권장**: EC2 인스턴스에서 서버에만 접근 가능한 SSH 키를 생성하여 GitHub 저장소에 등록하는 방식입니다. 이 방식은 GitHub 계정 비밀번호나 개인용 토큰을 서버에 저장하지 않아도 되므로 더 안전합니다.

```bash
# 1. EC2 인스턴스에서 SSH 키 생성 (프롬프트는 Enter로 기본값 사용)
ssh-keygen -t ed25519 -C "your-email@example.com"

# 2. 생성된 공개 키 확인 및 복사
cat ~/.ssh/id_ed25519.pub

# 3. GitHub 저장소에 배포 키 등록
#    - 프로젝트 GitHub > Settings > Deploy keys > "Add deploy key"
#    - Title: "EC2 API Server" 등 식별 가능한 이름 입력
#    - Key: 위에서 복사한 공개 키 붙여넣기 (`ssh-ed25519...`)
#    - "Allow write access"는 체크 해제 (보안 강화)

# 4. SSH 주소로 프로젝트 클론
#    <your-github-username>/<your-repo-name> 부분을 실제 정보로 변경
git clone git@github.com:<your-github-username>/securenet-fl-mvp.git
```

#### 4. API 서버 실행

```bash
# 클론된 프로젝트 디렉토리로 이동
cd securenet-fl-mvp/

# Docker Compose를 사용하여 API 서버 빌드 및 실행
docker compose up --build -d api
```

서버가 정상적으로 실행되면 `http://<EC2 인스턴스 Public IP>:8000` 주소로 API를 호출할 수 있습니다.

### 데이터 관리 (과거 BoltDB 사용 이력)

- 초기 구상 단계에서 데이터 관리 및 키-값 저장을 위해 `BoltDB`를 사용하는 것을 고려하고 관련 서버를 개발한 이력이 있습니다.
- 현재 MVP 프로젝트에서는 파일 기반의 데이터 처리(`CSV`)와 인메모리 모델(`XGBoost`)에 집중하고 있으나, 향후 시스템 확장 시 사용자 정보, 모델 버전 관리 등을 위해 `BoltDB`나 유사한 키-밸류 스토어의 재도입을 고려할 수 있습니다. 
