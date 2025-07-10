import argparse
import warnings
import flwr as fl
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import log_loss, accuracy_score
import time
import numpy as np
from typing import Dict, Tuple

warnings.filterwarnings("ignore", category=UserWarning)

def load_data(csv_path: str) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Load, preprocess data, and return training and test sets."""
    df = pd.read_csv(csv_path)
    
    # Simple feature engineering
    df['errorBalanceOrig'] = df['newbalanceOrig'] + df['amount'] - df['oldbalanceOrg']
    df['errorBalanceDest'] = df['oldbalanceDest'] + df['amount'] - df['newbalanceDest']

    all_types = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]
    df['type'] = pd.Categorical(df['type'], categories=all_types, ordered=True)
    df = pd.get_dummies(df, columns=['type'], prefix='type', drop_first=False)

    feature_columns = [
        "step", "amount", "oldbalanceOrg", "newbalanceOrig",
        "oldbalanceDest", "newbalanceDest", "isFlaggedFraud",
        "errorBalanceOrig", "errorBalanceDest"
    ] + [f'type_{t}' for t in all_types]
    
    df = df.reindex(columns=feature_columns + ['isFraud'], fill_value=0)

    X = df[feature_columns]
    y = df['isFraud']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if y.sum() > 1 else None
    )
    return X_train, X_test, y_train, y_test

class XgbClient(fl.client.NumPyClient):
    def __init__(self, X_train, X_test, y_train, y_test, client_id):
        self.X_train = X_train
        self.X_test = X_test
        self.y_train = y_train
        self.y_test = y_test
        self.client_id = client_id
        self.model = xgb.XGBClassifier(
            objective="binary:logistic",
            eval_metric="auc",
            use_label_encoder=False,
            n_estimators=3,
            max_depth=3,
            seed=42,
        )

    def get_parameters(self, config):
        booster = self.model.get_booster()
        return [bytearray(booster.save_raw())]

    def set_parameters(self, parameters):
        if not parameters:
            return
        booster = self.model.get_booster()
        booster.load_model(bytearray(parameters[0]))

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        self.model.fit(self.X_train, self.y_train)

        if config.get("server_round") == 3 and self.client_id == 0:
            print(f"Client {self.client_id}: Saving global model at round {config.get('server_round')}")
            self.model.save_model("ai/global_model.bin")

        return self.get_parameters(config={}), len(self.X_train), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        
        y_pred_proba = self.model.predict_proba(self.X_test)
        loss = log_loss(self.y_test, y_pred_proba)
        
        y_pred = self.model.predict(self.X_test)
        accuracy = accuracy_score(self.y_test, y_pred)
        
        return loss, len(self.X_test), {"accuracy": accuracy}

def main():
    print("Client started, waiting for 10 seconds before connecting...")
    time.sleep(10)

    parser = argparse.ArgumentParser(description="Flower XGBoost Client")
    parser.add_argument("--csv-path", type=str, required=True, help="Path to the local dataset (CSV)")
    parser.add_argument("--client-id", type=int, required=True, help="Unique ID for the client")
    args = parser.parse_args()

    print(f"Starting client {args.client_id} with data from {args.csv_path}")
    X_train, X_test, y_train, y_test = load_data(args.csv_path)
    
    fl.client.start_client(
        server_address="server:8080",
        client=XgbClient(X_train, X_test, y_train, y_test, args.client_id).to_client(),
    )

if __name__ == "__main__":
    main() 