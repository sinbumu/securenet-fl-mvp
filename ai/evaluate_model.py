import pandas as pd
import xgboost as xgb
from sklearn.metrics import accuracy_score, roc_auc_score, confusion_matrix, classification_report
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocesses the data in the same way as the client."""
    df['errorBalanceOrig'] = df['newbalanceOrig'] + df['amount'] - df['oldbalanceOrg']
    df['errorBalanceDest'] = df['oldbalanceDest'] + df['amount'] - df['newbalanceDest']

    all_types = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]
    df['type'] = pd.Categorical(df['type'], categories=all_types, ordered=True)
    
    type_dummies = pd.get_dummies(df['type'], prefix='type', drop_first=False)
    
    for t in all_types:
        col_name = f'type_{t}'
        if col_name not in type_dummies.columns:
            type_dummies[col_name] = 0
            
    type_columns = [f'type_{t}' for t in all_types]
    type_dummies = type_dummies[type_columns]
    
    df = pd.concat([df, type_dummies], axis=1)
    return df

def evaluate_model(model_path="ai/global_model.bin", eval_data_path="data/evaluation.csv"):
    """Loads the global model and evaluates it on the hold-out evaluation dataset."""
    print("--- Starting Model Evaluation ---")
    
    # 1. Load Model
    print(f"Loading model from {model_path}...")
    bst = xgb.Booster()
    bst.load_model(model_path)
    print("Model loaded successfully.")

    # 2. Load and Preprocess Evaluation Data
    print(f"Loading evaluation data from {eval_data_path}...")
    eval_df = pd.read_csv(eval_data_path)
    eval_df = preprocess_data(eval_df)
    
    base_features = [
        "step", "amount", "oldbalanceOrg", "newbalanceOrig",
        "oldbalanceDest", "newbalanceDest", "isFlaggedFraud",
        "errorBalanceOrig", "errorBalanceDest"
    ]
    type_features = [f'type_{t}' for t in ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]]
    feature_columns = base_features + type_features
    
    X_eval = eval_df[feature_columns]
    y_eval = eval_df['isFraud']
    
    # Set feature names for the booster if they are not already set
    if bst.feature_names is None:
        bst.feature_names = feature_columns
        
    d_eval = xgb.DMatrix(X_eval, label=y_eval)
    print("Evaluation data prepared.")

    # 3. Perform Prediction
    print("\n--- Performing Prediction ---")
    preds_proba = bst.predict(d_eval)
    preds_binary = (preds_proba > 0.5).astype(int)
    print("Prediction complete.")

    # 4. Calculate and Print Metrics
    print("\n--- Evaluation Results ---")
    accuracy = accuracy_score(y_eval, preds_binary)
    auc = roc_auc_score(y_eval, preds_proba)
    
    print(f"✅ Accuracy: {accuracy:.4f} ({(accuracy * 100):.2f}%)")
    print(f"✅ AUC Score: {auc:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_eval, preds_binary, target_names=['Not Fraud', 'Fraud']))

    print("Confusion Matrix:")
    cm = confusion_matrix(y_eval, preds_binary)
    print("               Predicted")
    print("              Not Fraud | Fraud")
    print("Actual Not Fraud | {:<7} | {:<5}".format(cm[0][0], cm[0][1]))
    print("Actual Fraud     | {:<7} | {:<5}".format(cm[1][0], cm[1][1]))
    print("---------------------------------")

if __name__ == "__main__":
    evaluate_model() 