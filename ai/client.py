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

def load_data(csv_path: str):
    """Load, preprocess data, and return training and test DMatrix."""
    df = pd.read_csv(csv_path)
    
    df['errorBalanceOrig'] = df['newbalanceOrig'] + df['amount'] - df['oldbalanceOrg']
    df['errorBalanceDest'] = df['oldbalanceDest'] + df['amount'] - df['newbalanceDest']

    # Ensure all transaction types are present as categorical
    all_types = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]
    df['type'] = pd.Categorical(df['type'], categories=all_types, ordered=True)
    
    # Create dummy variables for all possible transaction types
    type_dummies = pd.get_dummies(df['type'], prefix='type', drop_first=False)
    
    # Ensure all type columns exist, even if they're not in the data
    for t in all_types:
        col_name = f'type_{t}'
        if col_name not in type_dummies.columns:
            type_dummies[col_name] = 0
    
    # Reorder columns to ensure consistent ordering
    type_columns = [f'type_{t}' for t in all_types]
    type_dummies = type_dummies[type_columns]
    
    # Combine with original dataframe
    df = pd.concat([df, type_dummies], axis=1)

    base_features = [
        "step", "amount", "oldbalanceOrg", "newbalanceOrig",
        "oldbalanceDest", "newbalanceDest", "isFlaggedFraud",
        "errorBalanceOrig", "errorBalanceDest"
    ]
    type_features = [f'type_{t}' for t in all_types]
    feature_columns = base_features + type_features
    
    # Ensure all required columns exist
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0
    
    X = df[feature_columns]
    y = df['isFraud']
    
    # Debug: Print feature information
    print(f"Dataset: {csv_path}")
    print(f"Number of features: {len(feature_columns)}")
    print(f"Feature columns: {feature_columns}")
    print(f"X shape: {X.shape}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if y.sum() > 1 else None
    )
    
    dtrain = xgb.DMatrix(X_train, label=y_train)
    dtest = xgb.DMatrix(X_test, label=y_test)
    
    print(f"Training DMatrix feature count: {dtrain.num_col()}")
    print(f"Test DMatrix feature count: {dtest.num_col()}")
    
    return dtrain, dtest

class XgbClient(fl.client.NumPyClient):
    def __init__(self, dtrain, dtest, client_id):
        self.dtrain = dtrain
        self.dtest = dtest
        self.client_id = client_id
        self.model = xgb.Booster() # Initialize with an empty Booster
        # Define model parameters, consistent with the server
        self.params = {
            "objective": "binary:logistic",
            "eval_metric": "auc",
            "eta": 0.1,
            "max_depth": 3,
            "seed": 42,
            "scale_pos_weight": 773,  # To handle class imbalance
        }

    def get_parameters(self, config):
        if self.model is None:
            return []
        return [bytearray(self.model.save_raw())]

    def set_parameters(self, parameters):
        if not parameters:
            return
        self.model = xgb.Booster()
        self.model.load_model(bytearray(parameters[0]))

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        
        print(f"--- [Client {self.client_id}] Round {config.get('server_round', '?')}: Received model. Starting local training... ---")
        
        # Train the model
        for i in range(config.get("local_epochs", 1)):
            self.model = xgb.train(
                params=self.params,
                dtrain=self.dtrain,
                num_boost_round=1,
                xgb_model=self.model
            )
            print(f"Client {self.client_id}: Training epoch {i+1} complete.")

        print(f"--- [Client {self.client_id}] Round {config.get('server_round', '?')}: Local training finished. Sending update to server. ---")

        if config.get("server_round") == 3 and self.client_id == 0:
            print(f"Client {self.client_id}: Saving final global model (global_model.bin) at round {config.get('server_round')}")
            self.model.save_model("ai/global_model.bin")

        return self.get_parameters(config={}), self.dtrain.num_row(), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        
        preds_proba = self.model.predict(self.dtest)
        loss = log_loss(self.dtest.get_label(), preds_proba)
        
        preds_binary = (preds_proba > 0.5).astype(int)
        accuracy = accuracy_score(self.dtest.get_label(), preds_binary)
        
        print(f"--- [Client {self.client_id}] Round {config.get('server_round', '?')}: Evaluation results -> Accuracy: {accuracy:.4f}, Loss: {loss:.4f} ---")
        
        return loss, self.dtest.num_row(), {"accuracy": accuracy}

def main():
    print("Client started, waiting for 10 seconds before connecting...")
    time.sleep(10)

    parser = argparse.ArgumentParser(description="Flower XGBoost Client")
    parser.add_argument("--csv-path", type=str, required=True, help="Path to the local dataset (CSV)")
    parser.add_argument("--client-id", type=int, required=True, help="Unique ID for the client")
    args = parser.parse_args()

    print(f"Starting client {args.client_id} with data from {args.csv_path}")
    dtrain, dtest = load_data(args.csv_path)
    
    client = XgbClient(dtrain, dtest, args.client_id).to_client()
    fl.client.start_client(server_address="server:8080", client=client)

if __name__ == "__main__":
    main() 