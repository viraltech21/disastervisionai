import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

print("--- Training LSTM Temporal Forecasting Model (Temperature) ---")

# 1. Load Data
df_temp = pd.read_csv("data/GlobalTemperatures.csv")
df_temp = df_temp.dropna(subset=['LandAndOceanAverageTemperature'])
temp_data = df_temp['LandAndOceanAverageTemperature'].values.reshape(-1, 1)

# 2. Normalize
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_temp = scaler.fit_transform(temp_data)

# 3. Create sequences
def create_sequences(data, seq_length):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:(i + seq_length)])
        y.append(data[i + seq_length])
    return np.array(X), np.array(y)

seq_length = 10
X_temp, y_temp = create_sequences(scaled_temp, seq_length)

split = int(0.8 * len(X_temp))
X_train, X_test = X_temp[:split], X_temp[split:]
y_train, y_test = y_temp[:split], y_temp[split:]

# 4. Train LSTM Model
model = Sequential()
model.add(LSTM(50, return_sequences=True, input_shape=(seq_length, 1)))
model.add(Dropout(0.2))
model.add(LSTM(50))
model.add(Dropout(0.2))
model.add(Dense(1))

model.compile(optimizer='adam', loss='mean_squared_error')
model.fit(X_train, y_train, epochs=20, batch_size=32, validation_data=(X_test, y_test), verbose=1)

# 5. Evaluate
y_pred_scaled = model.predict(X_test)
y_pred = scaler.inverse_transform(y_pred_scaled)
y_true = scaler.inverse_transform(y_test.reshape(-1, 1))

rmse = np.sqrt(mean_squared_error(y_true, y_pred))
mae = mean_absolute_error(y_true, y_pred)

print(f"\n--- Temperature Forecasting Results ---")
print(f"RMSE: {rmse:.2f} degrees Celsius")
print(f"MAE: {mae:.2f} degrees Celsius")
