import flwr as fl
from flwr.common import Metrics, ndarrays_to_parameters, Parameters
from flwr.server.strategy import FedAvg
from flwr.server.server import ServerConfig
import xgboost as xgb
from typing import List, Tuple, Optional, Dict, Union
from flwr.common import FitRes, Scalar
import numpy as np

# Note: We don't need time.sleep() on the server anymore.

def get_evaluate_fn():
    """Return an evaluation function for server-side evaluation."""
    def evaluate(server_round: int, parameters: Parameters, config: Dict[str, Scalar]):
        # This function can be extended if server-side evaluation is needed.
        return None, {}
    return evaluate

def evaluate_config(server_round: int):
    """Return evaluation configuration dict for each round."""
    return {"server_round": server_round}
    
def fit_config(server_round: int):
    """Return training configuration dict for each round."""
    return {"server_round": server_round, "local_epochs": 1}

class SaveModelStrategy(FedAvg):
    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[fl.server.client_proxy.ClientProxy, FitRes]],
        failures: List[Union[Tuple[fl.server.client_proxy.ClientProxy, FitRes], BaseException]],
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:
        """Choose the first client's model and broadcast it."""
        if not results:
            return None, {}

        # Get the parameters from the first successful client
        params_from_first_client = results[0][1].parameters
        
        print(f"--- [Server] Round {server_round}: Aggregated updates. Broadcasting model from client {results[0][0].cid} for next round. ---")

        # At the final round, client 0 will save the model.
        if server_round == 3:
            print(f"--- [Server] Round {server_round}: Final round complete. Instructing client 0 to save the final model. ---")

        return params_from_first_client, {}

def main():
    """Start Flower server with server-side parameter initialization."""
    # Define the model structure. This should be consistent with the client.
    params = {
        "objective": "binary:logistic",
        "eval_metric": "auc",
        "eta": 0.1,
        "max_depth": 3,
        "seed": 42,
        "scale_pos_weight": 773,  # To handle class imbalance
    }
    # Create a dummy DMatrix. The number of features should match the client.
    # From client.py: 9 base features + 5 error features + 5 one-hot types = 19
    # Let's derive it programmatically to be safe.
    base_features = 9 # step, amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest, isFlaggedFraud, errorBalanceOrig, errorBalanceDest
    type_features = 5 # "CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"
    num_features = base_features + type_features
    dummy_dmatrix = xgb.DMatrix(np.zeros((1, num_features)), label=np.zeros(1))

    # Initialize the model using train to get a booster object
    booster = xgb.train(params, dummy_dmatrix, num_boost_round=0)

    # Extract initial parameters
    initial_parameters = ndarrays_to_parameters([bytearray(booster.save_raw())])

    # 3. Define the strategy, now with initial_parameters.
    strategy = SaveModelStrategy(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=3,
        min_evaluate_clients=3,
        min_available_clients=3,
        evaluate_fn=get_evaluate_fn(),
        on_fit_config_fn=fit_config,
        on_evaluate_config_fn=evaluate_config,
        initial_parameters=initial_parameters, # Pass the initialized parameters
    )

    # 4. Start the server.
    print("--- [Server] Starting Flower server with 3 rounds... ---")
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=ServerConfig(num_rounds=3),
        strategy=strategy,
    )

if __name__ == "__main__":
    main() 