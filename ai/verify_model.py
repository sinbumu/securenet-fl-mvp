import xgboost as xgb
import numpy as np

def verify_model(model_path="ai/global_model.bin"):
    """
    Loads a trained XGBoost model and prints its details for verification.
    """
    print(f"Verifying model at: {model_path}")
    try:
        # Load the model
        bst = xgb.Booster()
        bst.load_model(model_path)
        print("Model loaded successfully.")

        # Define expected features, as they might not be saved in the model file
        base_features = [
            "step", "amount", "oldbalanceOrg", "newbalanceOrig",
            "oldbalanceDest", "newbalanceDest", "isFlaggedFraud",
            "errorBalanceOrig", "errorBalanceDest"
        ]
        all_types = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]
        type_features = [f'type_{t}' for t in all_types]
        expected_features = base_features + type_features
        
        # Manually set feature names to the booster
        bst.feature_names = expected_features

        # 1. Print feature names
        feature_names = bst.feature_names
        print(f"\nNumber of features: {len(feature_names)}")
        print(f"Feature names: {feature_names}")
        
        if feature_names == expected_features:
            print("\n✅ Feature names were set successfully and match the expected list.")
        else:
            print("\n⚠️ [WARNING] Feature names do not match the expected list after being set.")

        # 2. Print number of boosting rounds (trees)
        num_trees = bst.num_boosted_rounds()
        print(f"\nNumber of boosted rounds (trees): {num_trees}")
        
        # We had 3 rounds, and each round adds 1 tree (num_boost_round=1 in client.py)
        if num_trees == 3:
            print("✅ Number of trees (3) matches the number of federated rounds.")
        else:
            print(f"⚠️ [WARNING] Expected 3 trees (one for each round), but got {num_trees}.")

        # 3. Print feature importance
        try:
            importance = bst.get_score(importance_type='gain')
            print("\nFeature importance (sorted by gain):")
            sorted_importance = sorted(importance.items(), key=lambda item: item[1], reverse=True)
            for feature, score in sorted_importance:
                print(f"- {feature}: {score:.4f}")
        except Exception as e:
            print(f"\nCould not get feature importance: {e}")

    except xgb.core.XGBoostError as e:
        print(f"❌ Error loading or verifying the model: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    verify_model() 