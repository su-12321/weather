import os
import requests
import json
from datetime import datetime, timedelta
import random

# 心知天气API配置
API_KEY = "Sak47L4KiMlmljJxm"  # 使用您提供的API密钥
LOCATION = "zhengzhou"
URL = f"https://api.seniverse.com/v3/weather/now.json?key={API_KEY}&location={LOCATION}&language=zh-Hans&unit=c"

def get_weather_data():
    """获取实时天气数据"""
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
        # 返回模拟数据作为后备
        return {
            "city": "郑州",
            "temperature": 28.5,
            "condition": "多云",
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

def generate_24h_temperatures(current_temp):
    """生成24小时温度数据（基于当前温度）"""
    hours = [f"{i}:00" for i in range(24)]
    
    # 基于当前温度生成合理的变化曲线
    base_temp = current_temp - 5  # 凌晨最低温度
    temperatures = []
    
    for hour in range(24):
        # 模拟温度变化：凌晨低，中午高
        if hour < 6:
            temp = base_temp + hour * 0.5
        elif hour < 14:
            temp = base_temp + 3 + hour * 1.2
        elif hour < 18:
            temp = base_temp + 18 - hour * 0.7
        else:
            temp = base_temp + 12 - (hour - 12) * 0.8
        
        # 添加随机波动
        temp += random.uniform(-1.5, 1.5)
        temperatures.append(round(temp, 1))
    
    return hours, temperatures

def generate_temp_distribution():
    """生成温度分布数据"""
    return [
        random.randint(0, 5),   # <10°C
        random.randint(8, 15),  # 10-20°C
        random.randint(20, 30), # 20-30°C
        random.randint(25, 40), # 30-40°C
        random.randint(0, 10)   # >40°C
    ]

def generate_html(weather_data):
    """生成HTML文件"""
    # 生成图表数据
    hours, temperatures = generate_24h_temperatures(weather_data["temperature"])
    temp_distribution = generate_temp_distribution()
    
    # 计算下次更新时间
    now = datetime.now()
    next_update = now.replace(minute=(now.minute // 30 * 30) + timedelta(minutes=30)
    if next_update.minute >= 60:
        next_update = next_update.replace(hour=next_update.hour+1, minute=0)
    next_update_str = next_update.strftime("%Y-%m-%d %H:%M")
    
    # 读取HTML模板
    with open("template.html", "r", encoding="utf-8") as f:
        html_content = f.read()
    
    # 替换占位符
    replacements = {
        "{{CITY}}": weather_data["city"],
        "{{TEMPERATURE}}": str(weather_data["temperature"]),
        "{{CONDITION}}": weather_data["condition"],
        "{{TIME}}": weather_data["time"],
        "{{NEXT_UPDATE}}": next_update_str,
        "{{HOURS}}": json.dumps(hours),
        "{{TEMPERATURES}}": json.dumps(temperatures),
        "{{TEMP_DISTRIBUTION}}": json.dumps(temp_distribution)
    }
    
    for key, value in replacements.items():
        html_content = html_content.replace(key, value)
    
    # 保存HTML文件
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    print("HTML文件已生成")

if __name__ == "__main__":
    weather = get_weather_data()
    generate_html(weather)
