import xgboost as xgb
import os

# Determine the absolute path to the model file
# This makes the model loading independent of the current working directory
base_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(base_dir, "global_model.bin")

def load_model() -> xgb.Booster:
    """
    Loads the XGBoost model from the specified path.
    """
    print(f"Loading model from: {MODEL_PATH}...")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    
    bst = xgb.Booster()
    bst.load_model(MODEL_PATH)
    print("Model loaded successfully.")
    return bst

# Load the model on application startup
model = load_model()
