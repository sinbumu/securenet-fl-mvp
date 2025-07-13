# SecureNet-FL: Fraud Detection API

이 문서는 연합 학습으로 생성된 사기 탐지 모델을 서빙하는 실시간 예측 API 서버의 기능 명세를 정의합니다.

## 1. 개요

- **목표**: 금융 거래 데이터를 입력받아, 해당 거래의 사기 위험도를 실시간으로 계산하고, 모델 성능 지표 및 의심 계정 목록을 제공합니다.
- **기반 모델**: `global_model.bin` (연합 학습으로 훈련된 XGBoost 모델)
- **기술 스택**: Python, FastAPI, Docker

## 2. 실행 방법 (로컬 테스트)

### 전제 조건
- Docker Desktop이 설치 및 실행 중이어야 합니다.
- 프로젝트 루트 디렉토리에서 아래 명령어를 실행합니다.

### 실행 명령어 (docker-compose 사용)
```bash
# API 서버를 빌드하고 백그라운드에서 실행합니다.
docker compose up --build -d api
```
서버가 성공적으로 실행되면 `http://localhost:8000` 에서 API 접속이 가능합니다.

### 중지 명령어
```bash
# 실행 중인 모든 서비스를 중지하고 컨테이너를 삭제합니다.
docker compose down
```

## 3. API 엔드포인트 명세

### 3.1. API 요약

| 경로 | 메서드 | 목적 / 호출 패턴 | 요청 예시 (Body) | 응답 예시 (Body) |
|---|---|---|---|---|
| `/risk-score` | **POST** | 사용자가 “위험도 조회” 버튼 클릭 시 | `{ "amount": 17500, ... }` | `{ "riskScore": 87.6, "riskLevel": "high" }` |
| `/evaluation-metrics` | **GET** | 대시보드 KPI 카드 – 페이지 첫 로드 시 | – | `{ "auc": 0.99, "recall": 0.99, ... }` |
| `/top-suspicious` | **GET** | 대시보드 테이블 – 주기적 (예: 5초) | – | `[ { "accountId": "A1029X", ... } ]` |
| `/` | **GET** | 헬스 체크 (LB, K8s liveness) | – | `{ "status": "ok" }` |
| `/docs` | **GET** | API 상세 문서를 위한 Swagger UI | – | (HTML 페이지 자동 생성) |


### 3.2. 엔드포인트 상세

---
#### **`POST /risk-score`**
- **설명**: 단일 거래 데이터에 대한 사기 위험도를 계산하고 위험 등급을 반환합니다.
- **요청 Body**: `application/json`
  ```json
  {
    "amount": 17500.0,
    "oldbalanceOrg": 20000.0,
    "newbalanceOrig": 2500.0,
    "type": "CASH_OUT"
  }
  ```
- **성공 응답 (200 OK)**:
  ```json
  {
    "riskScore": 0.6325,
    "riskLevel": "high"
  }
  ```
- **위험 등급 (riskLevel)**:
  - `high`: score > 0.6
  - `medium`: score > 0.4
  - `low`: score <= 0.4

---
#### **`GET /evaluation-metrics`**
- **설명**: 현재 배포된 모델의 사전 계산된 성능 지표를 반환합니다. (정적 데이터)
- **요청**: 없음
- **성공 응답 (200 OK)**:
  ```json
  {
    "auc": 0.9998,
    "recall": 0.998,
    "falsePositiveRate": 0.0004,
    "modelVer": "v1.0.3-final"
  }
  ```

---
#### **`GET /top-suspicious`**
- **설명**: 가장 의심스러운 상위 계정 목록을 반환합니다. (데모용 모의 데이터)
- **쿼리 파라미터**: `limit` (int, 기본값 10, 1~100)
- **요청 예시**: `GET http://localhost:8000/top-suspicious?limit=5`
- **성공 응답 (200 OK)**:
  ```json
  [
    { "accountId": "C123456789", "riskScore": 99.8 },
    { "accountId": "C123456790", "riskScore": 98.3 },
    { "accountId": "C123456791", "riskScore": 96.8 },
    { "accountId": "C123456792", "riskScore": 95.3 },
    { "accountId": "C123456793", "riskScore": 93.8 }
  ]
  ```

---
#### **`GET /`**
- **설명**: API 서버의 상태를 확인하는 헬스 체크 엔드포인트입니다.
- **요청**: 없음
- **성공 응답 (200 OK)**:
  ```json
  {
    "status": "ok"
  }
  ```

---
#### **`GET /docs`**
- **설명**: 모든 API 엔드포인트에 대한 대화형 문서를 제공하는 Swagger UI 페이지입니다. 브라우저에서 직접 API를 테스트해볼 수 있습니다.
- **요청**: 브라우저에서 `http://localhost:8000/docs` 로 접속 