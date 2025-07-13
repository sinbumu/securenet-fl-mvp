from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from model_loader import model
import xgboost as xgb
import pandas as pd
from typing import List

from schemas import (
    PredictionRequest, 
    PredictionResponse,
    EvaluationMetricsResponse,
    SuspiciousAccount,
    HealthCheckResponse
)

app = FastAPI(
    title="SecureNet Fraud Detection API",
    description="API for real-time fraud risk scoring and model monitoring.",
    version="1.0.0"
)

# --- CORS Middleware Settings ---
# 프론트엔드 애플리케이션의 주소를 허용합니다.
origins = [
    "http://13.209.117.252", # EC2 배포 주소
    "https://phenomenal-alfajores-024c07.netlify.app",
    "https://bolt.new", # Bolt.new 개발/테스트 환경용
    "http://localhost", # 로컬 테스트용
    "http://localhost:3000", # 로컬 테스트용 (React 기본 포트)
    "http://localhost:5173", # 로컬 테스트용 (React 기본 포트)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 모든 HTTP 메소드 허용
    allow_headers=["*"], # 모든 HTTP 헤더 허용
)


# --- Endpoints ---

@app.get("/", response_model=HealthCheckResponse, tags=["General"])
def health_check():
    """
    Performs a health check on the API.
    """
    return {"status": "ok"}

@app.post("/risk-score", response_model=PredictionResponse, tags=["Prediction"])
def predict_risk_score(request: PredictionRequest):
    """
    Calculates the risk score for a single transaction.
    """
    try:
        # 1. Feature Engineering (as seen in client.py)
        # Create a DataFrame from the request
        df = pd.DataFrame([request.dict()])

        # --- Replicate feature engineering from training ---
        # a. Set default values for missing features
        df['step'] = 1
        df['oldbalanceDest'] = 0.0
        df['newbalanceDest'] = 0.0
        df['isFlaggedFraud'] = 0

        # b. Create error balance features
        df['errorBalanceOrig'] = df['newbalanceOrig'] + df['amount'] - df['oldbalanceOrg']
        df['errorBalanceDest'] = df['oldbalanceDest'] + df['amount'] - df['newbalanceDest']

        # c. One-hot encode transaction type
        all_types = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]
        df['type'] = pd.Categorical(df['type'], categories=all_types)
        type_dummies = pd.get_dummies(df['type'], prefix='type', drop_first=False)
        
        # Ensure all type columns exist and are in the correct order
        for t in all_types:
            col_name = f'type_{t}'
            if col_name not in type_dummies.columns:
                type_dummies[col_name] = 0
        
        type_columns = [f'type_{t}' for t in all_types]
        type_dummies = type_dummies[type_columns]
        
        df = pd.concat([df, type_dummies], axis=1)

        # d. Define final feature set in the correct order
        feature_columns = [
            "step", "amount", "oldbalanceOrg", "newbalanceOrig",
            "oldbalanceDest", "newbalanceDest", "isFlaggedFraud",
            "errorBalanceOrig", "errorBalanceDest"
        ] + type_columns
        
        # Ensure dataframe has all columns in the correct order
        X_pred = df[feature_columns]
        
        # 2. Prediction
        dpredict = xgb.DMatrix(X_pred)
        score = model.predict(dpredict)[0]
        risk_score = float(score)

        # 3. Determine Risk Level
        if risk_score > 0.6:
            risk_level = "high"
        elif risk_score > 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {"riskScore": risk_score, "riskLevel": risk_level}

    except Exception as e:
        # Log the error for debugging
        print(f"Error during prediction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction.")

@app.get("/evaluation-metrics", response_model=EvaluationMetricsResponse, tags=["Monitoring"])
def get_metrics():
    """
    Returns pre-calculated evaluation metrics for the current model.
    These are static values based on the last evaluation run.
    """
    return {
        "auc": 0.9998,
        "recall": 0.998,
        "falsePositiveRate": 0.0004,
        "modelVer": "v1.0.3-final"
    }

@app.get("/top-suspicious", response_model=List[SuspiciousAccount], tags=["Monitoring"])
def get_top_suspicious_accounts(limit: int = Query(10, ge=1, le=100)):
    """
    Returns a list of top suspicious accounts.
    This is mock data for demonstration purposes.
    """
    # Generate some fake data
    mock_accounts = [
        {"accountId": f"C{123456789 + i}", "riskScore": 99.8 - i * 1.5} for i in range(20)
    ]
    return mock_accounts[:limit]
