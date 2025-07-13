import pandas as pd
import os
import numpy as np
from sklearn.model_selection import train_test_split

def prepare_data(input_path="data/PS_20174392719_1491204439457_log.csv", output_dir="data"):
    """
    Loads a CSV, splits it into training (90%) and evaluation (10%) sets.
    The training set is then further split into three parts for the clients.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load the dataset
    df = pd.read_csv(input_path)
    print(f"Original dataset loaded with {len(df)} rows.")

    # Split into training and evaluation sets (90% train, 10% test)
    # Using stratify on 'isFraud' to ensure both sets have a similar fraud ratio
    train_df, eval_df = train_test_split(df, test_size=0.1, random_state=42, stratify=df['isFraud'])
    
    print(f"Split data into {len(train_df)} training rows and {len(eval_df)} evaluation rows.")

    # Save the evaluation dataset
    output_eval = os.path.join(output_dir, 'evaluation.csv')
    eval_df.to_csv(output_eval, index=False)
    print(f"- Saved evaluation data to {output_eval}")

    # Shuffle and split the training data for the three clients
    shuffled_train_df = train_df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Split the DataFrame into three parts using indices
    part_size = len(shuffled_train_df) // 3
    df_a = shuffled_train_df.iloc[0:part_size]
    df_b = shuffled_train_df.iloc[part_size:2*part_size]
    df_c = shuffled_train_df.iloc[2*part_size:]


    # Define and save client data paths
    output_a = os.path.join(output_dir, 'paysim_a.csv')
    output_b = os.path.join(output_dir, 'paysim_b.csv')
    output_c = os.path.join(output_dir, 'paysim_c.csv')

    df_a.to_csv(output_a, index=False)
    df_b.to_csv(output_b, index=False)
    df_c.to_csv(output_c, index=False)

    print(f"Training data split into three files for clients:")
    print(f"- {output_a} with {len(df_a)} rows")
    print(f"- {output_b} with {len(df_b)} rows")
    print(f"- {output_c} with {len(df_c)} rows")

if __name__ == "__main__":
    prepare_data() 