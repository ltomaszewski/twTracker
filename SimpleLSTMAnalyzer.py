#!/usr/bin/env python
# coding: utf-8

# Let's import staff first

# In[173]:


import numpy as np
import matplotlib.pyplot as plt
import urllib.request, json
import datetime as dt
import tensorflow as tf

tf.random.set_seed(42)
np.random.seed(42)

CSV_FOLDER_PATH = "csv/tensorflow"


# Now let's load command line arguments

# In[174]:


import sys

debug = True

# Assign the arguments to variables
symbol = sys.argv[1]
# if symbol is None:
# symbol = "BTC"
timeinterval = sys.argv[2]
# if timeinterval is None:
# timeinterval = "D"

if debug:
    print("Debug MODE")


# Now we need to find csv file and build file path

# In[175]:


import os
import re

pattern = r"\w+BTC\w+D\w+.csv"
filePath = ""

for file in os.listdir(CSV_FOLDER_PATH): # loop through all files in folder
    if re.match(pattern, file): # check if file name matches pattern
        filePath = CSV_FOLDER_PATH + "/" + file

if debug:
    print("[DEBUG] input file" + filePath)


# Now lets load designed file

# In[176]:


import pandas as pd

data = pd.read_csv(filePath)
df = pd.DataFrame(columns=['Date','Low','High','Close','Open'])

for index,row in data.iterrows():
    date = dt.datetime.strptime(row['Date'], '%Y-%m-%d')
    data_row = [date.date(),float(row['Low']),float(row['High']),
                float(row['Close']),float(row['Open'])]
    df.loc[-1,:] = data_row
    df.index = df.index + 1

df = df.sort_values('Date')

if debug:
    print("Loaded data")
    print(df)


# Now lets split data to train and test

# In[177]:


test_ratio = 0.02
training_ratio = 1 - test_ratio
train_size = int(training_ratio * len(data))
test_size = int(test_ratio * len(data))
print("train_size: " + str(train_size))
print("test_size: " + str(test_size))
train = data[:train_size][['Date', 'Open', 'Close','Low','High']]
test = data[train_size:][['Date', 'Open', 'Close','Low','High']]
data = data.set_index('Date')



# Now let's prepare data for training and let's create model

# In[178]:


from sklearn.preprocessing import StandardScaler
from keras.models import Model
from keras.layers import Dense, LSTM, Input

window_size = 30
layer_units, optimizer = 50, 'adam'
cur_epochs = 50
cur_batch_size = 20

scaler = StandardScaler() # setup scaler
scaled_data = scaler.fit_transform(data[['Close']])
scaled_data_train = scaled_data[:train.shape[0]]

X_train = [] # setup train data
y_train = []

for i in range(window_size, len(scaled_data_train)):
    X_train.append(scaled_data_train[i-window_size:i, 0])
    y_train.append(scaled_data_train[i, 0])
X_train, y_train = np.array(X_train), np.array(y_train)

X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))

inp = Input(shape=(X_train.shape[1], 1))
layer_units, optimizer = 100, 'adam'
cur_epochs = 50
cur_batch_size = 20
x = LSTM(units=layer_units, return_sequences=True)(inp)
x = LSTM(units=layer_units)(x)
out = Dense(1, activation='linear')(x)
model = Model(inp, out)
model.compile(loss = 'mean_squared_error', optimizer = 'adam')
history = model.fit(X_train, y_train, epochs=cur_epochs, batch_size=cur_batch_size, verbose=1, validation_split=0.1, shuffle=True)


# 

# Lets test model

# In[179]:


raw = data['Close'][len(data) - len(test) - window_size:]
raw = raw.values.reshape(-1,1)
raw = scaler.transform(raw)
X_test = []
for i in range(window_size, raw.shape[0]):
    X_test.append(raw[i-window_size:i, 0])

X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))

predicted_price_ = model.predict(X_test)
predicted_price = scaler.inverse_transform(predicted_price_)

testClose = test['Close']

rmse = np.sqrt(np.mean((np.array(testClose)-np.array(predicted_price))**2))
print(rmse)

y_pred, y_true = np.array(predicted_price), np.array(testClose)
mape = np.mean(np.abs((y_true-y_pred) / y_true))*100
print(mape)


# In[180]:


import os

lastDate = data.index[-1]
OUTPUT_PATH = "prediction/" + lastDate + "/" + symbol + "/" + timeinterval

if not os.path.exists(OUTPUT_PATH):
    os.makedirs(OUTPUT_PATH)


# In[181]:


plt.plot(test.iloc[:, 1:2].values, color = 'black', label = 'Open BTC Price')
plt.plot(test.iloc[:, 2:3].values, color = 'blue', label = 'Close BTC Price')
plt.plot(test.iloc[:, 3:4].values, color = 'pink', label = 'Low BTC Price')
plt.plot(predicted_price, color = 'green', label = 'Predicted BTC Price')
plt.title('BTC Stock Price Prediction')
plt.xlabel('Time')
plt.legend()
plt.savefig(OUTPUT_PATH + "/prediction_validation.png")
plt.show()

plt.figure(figsize=(16,8))
plt.plot(history.history['loss'], label='MSE (training data)')
plt.title('MSE')
plt.ylabel('MSE value')
plt.xlabel('No. epoch')
plt.legend(loc="upper left")
plt.savefig(OUTPUT_PATH + "/mse.png")
plt.show()


# In[182]:


seed = data[-window_size:]['Close']

for i in range(1,2):
    last_days = seed.values.reshape(-1,1)
    scaled_last_days = scaler.transform(last_days)
    input_data = np.reshape(scaled_last_days, (1, window_size, 1))
    prediction = model.predict(input_data)
    predicted_price2 = scaler.inverse_transform(prediction)[0][0]
    newSeed = seed.copy()
    newSeed[lastDate] = predicted_price2
    seed = newSeed[-window_size:]


    print(f"New Price {predicted_price2}")


# Let's generate output for node.js script

# In[183]:


import json
import datetime

last_date_object = datetime.datetime.strptime(lastDate, "%Y-%m-%d") + datetime.timedelta(days=1)

# Create a dictionary with the variables
json_data = {
    "symbol": symbol,
    "timeinterval": timeinterval,
    "rmse": rmse,
    "mape": mape,
    "date": last_date_object.strftime("%Y-%m-%d"),
    "prediction": str(predicted_price2),
}

with open(OUTPUT_PATH + "/output.json", 'w') as json_file:
    json.dump(json_data, json_file)


# In[183]:




