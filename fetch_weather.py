import requests
import json
import time
from datetime import datetime

# 心知天气API配置
API_KEY = "Sak47L4KiM4lmljJxm"  # 替换为你的实际API密钥
LOCATION = "zhengzhou"
URL = f"https://api.seniverse.com/v3/weather/now.json?key={API_KEY}&location={LOCATION}&language=zh-Hans&unit=c"

def get_weather_data():
    try:
        response = requests.get(URL)
        response.raise_for_status()
        data = response.json()
        
        # 解析数据
        city = data['results'][0]['location']['name']
        temp = float(data['results'][0]['now']['temperature'])
        condition = data['results'][0]['now']['text']
        update_time = data['results'][0]['last_update']
        
        # 转换为本地时间字符串
        local_time = datetime.strptime(update_time, "%Y-%m-%dT%H:%M:%S+08:00")
        local_time_str = local_time.strftime("%Y-%m-%d %H:%M:%S")
        
        return {
            "city": city,
            "temperature": temp,
            "condition": condition,
            "time": local_time_str
        }
    except Exception as e:
        print(f"获取天气数据失败: {e}")
        return None

def save_to_html(weather_data, filename="weather.html"):
    # 读取模板
    with open("template.html", "r", encoding="utf-8") as f:
        html_content = f.read()
    
    # 替换占位符
    html_content = html_content.replace("{{CITY}}", weather_data["city"])
    html_content = html_content.replace("{{TEMPERATURE}}", str(weather_data["temperature"]))
    html_content = html_content.replace("{{CONDITION}}", weather_data["condition"])
    html_content = html_content.replace("{{TIME}}", weather_data["time"])
    
    # 保存HTML文件
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"已生成: {filename}")

if __name__ == "__main__":
    weather = get_weather_data()
    if weather:
        save_to_html(weather)
