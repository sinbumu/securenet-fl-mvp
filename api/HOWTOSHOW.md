# Frontend Demo Guide: `/risk-score`

This document provides examples for demonstrating the different risk levels (`low`, `medium`, `high`) using the `/risk-score` API endpoint.

---

### 시나리오 1: 정상 거래 (Low Risk)

- **설명**: 소액의 일반적인 결제 거래입니다. 시스템은 이 거래를 안전하다고 판단합니다.
- **Request**:
```bash
curl -X POST "http://localhost:8000/risk-score" \
-H "Content-Type: application/json" \
-d '{
  "amount": 17500,
  "oldbalanceOrg": 200000,
  "newbalanceOrig": 182500,
  "type": "PAYMENT"
}'
```
- **Expected Response**:
```json
{
  "riskScore": 0.00128,
  "riskLevel": "low"
}
```

---

### 시나리오 2: 의심스러운 거래 (Medium Risk)

- **설명**: 비교적 큰 금액이 이체되고, 잔액에 약간의 불일치가 있습니다. 시스템은 추가적인 주의가 필요하다고 판단합니다.
- **Request**:
```bash
curl -X POST "http://localhost:8000/risk-score" \
-H "Content-Type: application/json" \
-d '{
  "amount": 50000,
  "oldbalanceOrg": 50000,
  "newbalanceOrig": 0,
  "type": "CASH_OUT"
}'
```
- **Expected Response**:
```json
{
  "riskScore": 0.4571,
  "riskLevel": "medium"
}
```
*(Note: 실제 점수는 모델 버전에 따라 약간 다를 수 있습니다.)*

---

### 시나리오 3: 사기 위험 거래 (High Risk)

- **설명**: 계좌의 모든 잔액을 인출하는 패턴입니다. 이는 실제 사기 거래 데이터에서 발견된 패턴과 매우 유사하여, 시스템이 높은 위험으로 탐지합니다.
- **Request**:
```bash
curl -X POST "http://localhost:8000/risk-score" \
-H "Content-Type: application/json" \
-d '{
  "amount": 181.0,
  "oldbalanceOrg": 181.0,
  "newbalanceOrig": 0.0,
  "type": "TRANSFER"
}'
```
- **Expected Response**:
```json
{
  "riskScore": 0.6325,
  "riskLevel": "high"
}
```
*(Note: 이 예시는 실제 사기 데이터에서 가져온 것입니다.)* 