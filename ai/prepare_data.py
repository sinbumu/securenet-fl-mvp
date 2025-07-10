import pandas as pd
from sklearn.model_selection import train_test_split
import os

def prepare_data():
    """
    Loads the original paysim dataset, performs a stratified split based on
    the 'isFraud' column, and saves the two resulting datasets for Bank A and Bank B.
    """
    # Define file paths
    original_data_path = 'data/PS_20174392719_1491204439457_log.csv'
    bank_a_path = 'data/paysim_a.csv'
    bank_b_path = 'data/paysim_b.csv'
    data_dir = 'data'

    # Check if data directory exists
    if not os.path.exists(data_dir):
        print(f"Directory '{data_dir}' not found. Please make sure the data is in the correct location.")
        return

    # Check if source file exists
    if not os.path.exists(original_data_path):
        print(f"Original data file not found at '{original_data_path}'")
        return

    print(f"Loading original dataset from '{original_data_path}'...")
    df = pd.read_csv(original_data_path)

    print("Splitting the dataset into two parts (50/50) with stratification...")
    
    # We create a dummy 'y' for splitting, as train_test_split needs it.
    # The actual features are the entire dataframe.
    X = df.index
    y = df['isFraud']

    # First split: 50% for bank_a_df, 50% for the rest
    X_a, X_b, y_a, y_b = train_test_split(X, y, test_size=0.5, random_state=42, stratify=y)
    
    bank_a_df = df.loc[X_a]
    bank_b_df = df.loc[X_b]

    print(f"Saving dataset for Bank A to '{bank_a_path}'...")
    bank_a_df.to_csv(bank_a_path, index=False)

    print(f"Saving dataset for Bank B to '{bank_b_path}'...")
    bank_b_df.to_csv(bank_b_path, index=False)

    print("Data preparation complete.")
    print(f"Bank A data shape: {bank_a_df.shape}, Fraud cases: {bank_a_df['isFraud'].sum()}")
    print(f"Bank B data shape: {bank_b_df.shape}, Fraud cases: {bank_b_df['isFraud'].sum()}")


if __name__ == "__main__":
    prepare_data() 