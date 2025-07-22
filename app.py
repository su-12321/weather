from flask import Flask, render_template, jsonify, request
import requests
import os
from datetime import datetime, timedelta

app = Flask(__name__)

# 心知天气API密钥
API_KEY = "Sak47L4KiMlmljJxm"
BASE_URL = "https://api.seniverse.com/v3/weather"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/current')
def current_weather():
    location = request.args.get('location', 'zhengzhou')
    url = f"{BASE_URL}/now.json?key={API_KEY}&location={location}&language=zh-Hans&unit=c"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/daily')
def daily_forecast():
    location = request.args.get('location', 'zhengzhou')
    url = f"{BASE_URL}/daily.json?key={API_KEY}&location={location}&language=zh-Hans&unit=c&start=0&days=5"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=os.getenv('DEBUG', 'False') == 'True')
