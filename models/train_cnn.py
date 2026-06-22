import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Flatten, Dense

print("--- Training CNN Geographic Vulnerability Model ---")

# 1. Load Data
df = pd.read_csv("data/flood.csv")

X = df.drop(columns=['FloodProbability']).values
y = (df['FloodProbability'] > 0.5).astype(int).values

# 2. Normalize and Reshape for CNN
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_reshaped = X_scaled.reshape(X_scaled.shape[0], X_scaled.shape[1], 1)

X_train, X_test, y_train, y_test = train_test_split(X_reshaped, y, test_size=0.2, random_state=42)

# 3. Train 1D CNN
cnn_model = Sequential()
cnn_model.add(Conv1D(filters=32, kernel_size=2, activation='relu', input_shape=(X_train.shape[1], 1)))
cnn_model.add(MaxPooling1D(pool_size=2))
cnn_model.add(Flatten())
cnn_model.add(Dense(64, activation='relu'))
cnn_model.add(Dense(1, activation='sigmoid'))

cnn_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
cnn_model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test), verbose=1)

# 4. Evaluate
loss, accuracy = cnn_model.evaluate(X_test, y_test, verbose=0)
print(f"\nCNN Vulnerability Model Accuracy: {accuracy:.2%}")
