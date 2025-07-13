from pydantic import BaseModel, Field
from typing import List, Literal

class PredictionRequest(BaseModel):
    amount: float = Field(..., example=17500.0)
    oldbalanceOrg: float = Field(..., example=20000.0)
    newbalanceOrig: float = Field(..., example=2500.0)
    type: Literal["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"] = Field(..., example="CASH_OUT")

class PredictionResponse(BaseModel):
    riskScore: float = Field(..., description="The predicted risk score, from 0 to 1.", example=0.876)
    riskLevel: Literal["low", "medium", "high"] = Field(..., description="The risk level based on the score.", example="high")

class EvaluationMetricsResponse(BaseModel):
    auc: float = Field(..., example=0.9998)
    recall: float = Field(..., example=0.998)
    falsePos: float = Field(..., example=0.0004, alias="falsePositiveRate")
    modelVer: str = Field(..., example="v1.0.3-final")

class SuspiciousAccount(BaseModel):
    accountId: str = Field(..., example="A1029X")
    riskScore: float = Field(..., example=98.4)

class HealthCheckResponse(BaseModel):
    status: str = Field(..., example="ok")
