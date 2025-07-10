import flwr as fl
from flwr.common import Metrics, ndarrays_to_parameters, parameters_to_ndarrays
from flwr.server.strategy import FedAvg
from flwr.server.server import ServerConfig
import xgboost as xgb
from typing import List, Tuple, Optional, Dict, Union
from flwr.common import FitRes, Parameters, Scalar
import numpy as np
import time

def get_evaluate_fn():
    """Return an evaluation function for server-side evaluation."""
    # This function is not strictly necessary for this example, 
    # but it's good practice to have a placeholder.
    def evaluate(server_round: int, parameters: Parameters, config: Dict[str, Scalar]):
        return None, {}
    return evaluate

def evaluate_config(server_round: int):
    """Return evaluation configuration dict for each round."""
    config = {
        "server_round": server_round,
    }
    return config
    
def fit_config(server_round: int):
    """Return training configuration dict for each round."""
    config = {
        "server_round": server_round,
        "local_epochs": 1,
    }
    return config

class SaveModelStrategy(FedAvg):
    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[fl.server.client_proxy.ClientProxy, FitRes]],
        failures: List[Union[Tuple[fl.server.client_proxy.ClientProxy, FitRes], BaseException]],
    ) -> Tuple[Optional[Parameters], Dict[str, Scalar]]:
        """Aggregate fit results using weighted average and save the model."""
        aggregated_parameters, aggregated_metrics = super().aggregate_fit(
            server_round, results, failures
        )

        if aggregated_parameters is not None and server_round == 3:
            print(f"Round {server_round}: Saving final global model...")
            print("Model parameters could be saved here if needed.")

        return aggregated_parameters, aggregated_metrics

def main():
    """Start Flower server."""
    print("Server starting, waiting 15 seconds for clients to be ready...")
    time.sleep(15)

    # Define strategy
    strategy = SaveModelStrategy(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=2,
        min_evaluate_clients=2,
        min_available_clients=2,
        evaluate_fn=get_evaluate_fn(),
        on_fit_config_fn=fit_config,
        on_evaluate_config_fn=evaluate_config,
        initial_parameters=None,
    )

    # Start server
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=ServerConfig(num_rounds=3),
        strategy=strategy,
    )

if __name__ == "__main__":
    main() 