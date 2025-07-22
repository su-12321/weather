// 获取DOM元素
const citySelect = document.getElementById('city-select');
const citySearch = document.getElementById('city-search');
const searchBtn = document.getElementById('search-btn');
const refreshBtn = document.getElementById('refresh-btn');
const temperature = document.getElementById('temperature');
const weatherText = document.getElementById('weather-text');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');
const updateTime = document.getElementById('update-time');
const locationEl = document.getElementById('location');
const timezoneEl = document.getElementById('timezone');
const locationDisplay = document.getElementById('location-display');
const errorContainer = document.getElementById('error-container');
const lastUpdateTime = document.getElementById('last-update-time');

// 图表实例
let lineChart, barChart;

// 天气代码到图标的映射
const weatherIcons = {
    '0': '<i class="fas fa-sun"></i>',  // 晴
    '1': '<i class="fas fa-cloud-sun"></i>',  // 多云
    '2': '<i class="fas fa-cloud"></i>',  // 阴
    '3': '<i class="fas fa-cloud-rain"></i>',  // 阵雨
    '4': '<i class="fas fa-bolt"></i>',  // 雷阵雨
    '5': '<i class="fas fa-poo-storm"></i>',  // 雷阵雨伴有冰雹
    '6': '<i class="fas fa-snowflake"></i>',  // 雨夹雪
    '7': '<i class="fas fa-snowflake"></i>',  // 小雪
    '8': '<i class="fas fa-cloud-showers-heavy"></i>',  // 中雨
    '9': '<i class="fas fa-smog"></i>',  // 雾
    '10': '<i class="fas fa-icicles"></i>', // 冻雨
    '11': '<i class="fas fa-cloud-rain"></i>', // 小雨
    '12': '<i class="fas fa-cloud-showers-heavy"></i>', // 大雨
    '13': '<i class="fas fa-cloud-showers-heavy"></i>', // 暴雨
    '14': '<i class="fas fa-snowflake"></i>', // 大雪
    '15': '<i class="fas fa-snowflake"></i>', // 暴雪
    '16': '<i class="fas fa-cloud-showers-heavy"></i>', // 特大暴雨
    '17': '<i class="fas fa-cloud-showers-heavy"></i>', // 大暴雨
    '18': '<i class="fas fa-cloud-showers-heavy"></i>', // 暴雨
    '19': '<i class="fas fa-cloud-showers-heavy"></i>', // 大雨
    '20': '<i class="fas fa-cloud-showers-heavy"></i>', // 中雨
    '21': '<i class="fas fa-cloud-rain"></i>', // 小雨
    '22': '<i class="fas fa-snowflake"></i>', // 中雪
    '23': '<i class="fas fa-snowflake"></i>', // 大雪
    '24': '<i class="fas fa-snowflake"></i>', // 暴雪
    '25': '<i class="fas fa-cloud-showers-heavy"></i>', // 大暴雨
    '26': '<i class="fas fa-wind"></i>', // 浮尘
    '27': '<i class="fas fa-wind"></i>', // 扬沙
    '28': '<i class="fas fa-wind"></i>', // 沙尘暴
    '29': '<i class="fas fa-wind"></i>', // 强沙尘暴
    '30': '<i class="fas fa-smog"></i>', // 雾
    '31': '<i class="fas fa-smog"></i>', // 霾
    '32': '<i class="fas fa-wind"></i>', // 风
    '33': '<i class="fas fa-hurricane"></i>', // 飓风
    '34': '<i class="fas fa-hurricane"></i>', // 热带风暴
    '35': '<i class="fas fa-tornado"></i>', // 龙卷风
    '36': '<i class="fas fa-temperature-low"></i>', // 冷
    '37': '<i class="fas fa-temperature-high"></i>', // 热
    '99': '<i class="fas fa-question"></i>'  // 未知
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    fetchCurrentWeather();
    initCharts();
    startAutoRefresh();
});

// 事件监听
refreshBtn.addEventListener('click', fetchCurrentWeather);
searchBtn.addEventListener('click', searchCity);
citySearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCity();
});

// 时间范围选择器
document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        updateLineChart(parseInt(this.dataset.hours));
    });
});

// 搜索城市
function searchCity() {
    const city = citySearch.value.trim();
    if (city) {
        fetchCurrentWeather(city);
        citySearch.value = '';
    }
}

// 获取当前天气
async function fetchCurrentWeather(city = citySelect.value) {
    try {
        const response = await fetch(`/api/current?location=${city}`);
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayWeather(data.results[0]);
        updateLastUpdateTime();
        hideError();
        
        // 获取预报数据
        fetchDailyForecast(city);
    } catch (error) {
        showError(`获取天气数据失败: ${error.message}`);
    }
}

// 获取天气预报
async function fetchDailyForecast(city) {
    try {
        const response = await fetch(`/api/daily?location=${city}`);
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        updateBarChart(data.results[0]);
    } catch (error) {
        console.error('获取预报数据失败:', error);
    }
}

// 显示天气信息
function displayWeather(weatherData) {
    const location = weatherData.location;
    const now = weatherData.now;
    
    // 更新基本信息
    temperature.textContent = `${now.temperature}°C`;
    weatherText.textContent = now.text;
    weatherIcon.innerHTML = weatherIcons[now.code] || '<i class="fas fa-question"></i>';
    feelsLike.textContent = `${parseInt(now.temperature) - 1}°C`; // 模拟体感温度
    locationEl.textContent = `${location.name}, ${location.region}, ${location.country}`;
    locationDisplay.textContent = location.name;
    timezoneEl.textContent = location.timezone;
    
    // 格式化更新时间
    const updateDate = new Date(weatherData.last_update);
    updateTime.textContent = updateDate.toLocaleString('zh-CN');
}

// 更新最后更新时间
function updateLastUpdateTime() {
    lastUpdateTime.textContent = new Date().toLocaleTimeString('zh-CN');
}

// 初始化图表
function initCharts() {
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const barCtx = document.getElementById('barChart').getContext('2d');
    
    // 折线图
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: '温度 (°C)',
                data: generateRandomTemps(24, 20, 35),
                borderColor: 'rgba(79, 172, 254, 0.8)',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: 'rgba(79, 172, 254, 1)',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: '温度 (°C)',
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
    
    // 柱状图
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: generateDateLabels(5),
            datasets: [{
                label: '最高温度 (°C)',
                data: generateRandomTemps(5, 25, 35),
                backgroundColor: 'rgba(253, 187, 45, 0.7)',
                borderColor: 'rgba(253, 187, 45, 1)',
                borderWidth: 1
            }, {
                label: '最低温度 (°C)',
                data: generateRandomTemps(5, 15, 25),
                backgroundColor: 'rgba(26, 42, 108, 0.7)',
                borderColor: 'rgba(26, 42, 108, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: '温度 (°C)',
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// 更新折线图数据
function updateLineChart(hours = 24) {
    lineChart.data.labels = generateTimeLabels(hours);
    lineChart.data.datasets[0].data = generateRandomTemps(hours, 20, 35);
    lineChart.update();
}

// 更新柱状图数据
function updateBarChart(forecastData) {
    const daily = forecastData.daily;
    
    // 更新标签
    barChart.data.labels = daily.map(day => day.date);
    
    // 更新数据
    barChart.data.datasets[0].data = daily.map(day => day.high);
    barChart.data.datasets[1].data = daily.map(day => day.low);
    
    barChart.update();
}

// 生成时间标签
function generateTimeLabels(hours) {
    const now = new Date();
    const labels = [];
    
    for (let i = hours - 1; i >= 0; i--) {
        const time = new Date(now);
        time.setHours(now.getHours() - i);
        labels.push(time.getHours() + ':00');
    }
    
    return labels;
}

// 生成日期标签
function generateDateLabels(days) {
    const now = new Date();
    const labels = [];
    
    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        labels.push(date.toLocaleDateString('zh-CN', {month: 'short', day: 'numeric'}));
    }
    
    return labels;
}

// 生成随机温度数据
function generateRandomTemps(count, min, max) {
    return Array.from({length: count}, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

// 显示错误信息
function showError(message) {
    errorContainer.style.display = 'block';
    errorContainer.textContent = message;
}

// 隐藏错误信息
function hideError() {
    errorContainer.style.display = 'none';
}

// 自动刷新
function startAutoRefresh() {
    setInterval(() => {
        fetchCurrentWeather();
    }, 300000); // 每5分钟刷新一次
}

// 模拟导出数据功能
document.getElementById('export-btn').addEventListener('click', () => {
    alert('数据导出功能需要后端支持。在实际应用中，可以将数据导出为CSV或Excel格式。');
});
