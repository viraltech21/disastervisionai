import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

print("--- Training Ensemble Disaster Risk Classifier ---")

# 1. Load Dataset
df_flood = pd.read_csv("data/flood.csv")

# 2. Preprocessing
X = df_flood.drop(columns=['FloodProbability'])
y = (df_flood['FloodProbability'] > 0.5).astype(int)

# Split into 80% training and 20% validation
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Model Development & Training
ensemble_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
ensemble_model.fit(X_train, y_train)

# 4. Predictions & Evaluation
y_pred = ensemble_model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print(f"Classification Accuracy: {accuracy:.2%}")
print(f"Precision: {precision:.2f}")
print(f"Recall: {recall:.2f}")
print(f"F1 Score: {f1:.2f}")
