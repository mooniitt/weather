import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 天气背景类型：晴天、雨天、阴天、雪天
export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'snowy'

// 数据集模式：'china' (全国主要城市) | 'zhejiang' (浙江省地级市) | 'hangzhou' (杭州行政区)
export type DatasetMode = 'china' | 'zhejiang' | 'hangzhou'

// 城市气象数据接口 (已与 china_weather.json 格式对齐)
export interface City {
  id: string
  name: string
  pinyin: string
  parent: string // 归属地（国家、省份或上级城市）
  province?: string
  temp: number
  feelsLike: string
  weather: string // 天气状况描述
  time: string
  weatherType: WeatherType
  humidity: string
  wind: string
  pressure: string
  uvIndex: string
  hourlyForecast?: Array<{
    time: string
    temp: number
    weather: string
    humidity: string
  }>
}

export const useWeatherStore = defineStore('weather', () => {
  // 数据集模式切换，默认为全中国
  const mode = ref<DatasetMode>('china')
  // 当前选中的城市 ID
  const currentCityId = ref('beijing')

  // 1. 全国核心城市数据集 (源自 china_weather_2026-04-17.json)
  const chinaCities = ref<City[]>([
    {
      id: 'beijing', name: '北京市', pinyin: 'Beijing', parent: '中国', province: '北京', temp: 19, feelsLike: '19°C', weather: '薄雾 (Mist)', time: '14:00', weatherType: 'cloudy',
      humidity: '68%', wind: 'SSW 6km/h', pressure: '1012 hPa', uvIndex: '6',
      hourlyForecast: [{ time: '12:00', temp: 19, weather: 'Mist', humidity: '68%' }, { time: '15:00', temp: 21, weather: 'Sunny', humidity: '73%' }]
    },
    {
      id: 'shanghai', name: '上海市', pinyin: 'Shanghai', parent: '中国', province: '上海', temp: 20, feelsLike: '20°C', weather: '多云 (Partly cloudy)', time: '14:00', weatherType: 'cloudy',
      humidity: '72%', wind: 'S 11km/h', pressure: '1013 hPa', uvIndex: '5',
      hourlyForecast: [{ time: '12:00', temp: 20, weather: 'Partly cloudy', humidity: '72%' }, { time: '15:00', temp: 20, weather: 'Sunny', humidity: '72%' }]
    },
    {
      id: 'guangzhou', name: '广州市', pinyin: 'Guangzhou', parent: '中国', province: '广东', temp: 27, feelsLike: '29°C', weather: '多云 (Partly cloudy)', time: '14:00', weatherType: 'cloudy',
      humidity: '74%', wind: 'S 13km/h', pressure: '1013 hPa', uvIndex: '10'
    },
    { id: 'shenzhen', name: '深圳市', pinyin: 'Shenzhen', parent: '中国', province: '广东', temp: 28, feelsLike: '30°C', weather: '多云 (Partly Cloudy)', time: '14:00', weatherType: 'cloudy', humidity: '69%', wind: 'SSE 10km/h', pressure: '1012 hPa', uvIndex: '11' },
    { id: 'chengdu', name: '成都市', pinyin: 'Chengdu', parent: '中国', province: '四川', temp: 25, feelsLike: '26°C', weather: '晴天 (Sunny)', time: '14:00', weatherType: 'sunny', humidity: '47%', wind: 'S 13km/h', pressure: '1015 hPa', uvIndex: '10' },
    { id: 'chongqing', name: '重庆市', pinyin: 'Chongqing', parent: '中国', province: '重庆', temp: 25, feelsLike: '25°C', weather: '晴天 (Sunny)', time: '14:00', weatherType: 'sunny', humidity: '39%', wind: 'NE 6km/h', pressure: '1013 hPa', uvIndex: '9' },
    { id: 'wuhan', name: '武汉市', pinyin: 'Wuhan', parent: '中国', province: '湖北', temp: 26, feelsLike: '27°C', weather: '晴天 (Sunny)', time: '14:00', weatherType: 'sunny', humidity: '47%', wind: 'ESE 10km/h', pressure: '1012 hPa', uvIndex: '8' },
    { id: 'xian', name: '西安市', pinyin: 'Xian', parent: '中国', province: '陕西', temp: 26, feelsLike: '25°C', weather: '晴天 (Sunny)', time: '14:00', weatherType: 'sunny', humidity: '26%', wind: 'ENE 9km/h', pressure: '1014 hPa', uvIndex: '8' },
    { id: 'harbin', name: '哈尔滨市', pinyin: 'Harbin', parent: '中国', province: '黑龙江', temp: 10, feelsLike: '8°C', weather: '小雨 (Light drizzle)', time: '14:00', weatherType: 'rainy', humidity: '92%', wind: 'S 12km/h', pressure: '1008 hPa', uvIndex: '0' },
    { id: 'kunming', name: '昆明市', pinyin: 'Kunming', parent: '中国', province: '云南', temp: 26, feelsLike: '26°C', weather: '晴天 (Sunny)', time: '14:00', weatherType: 'sunny', humidity: '26%', wind: 'SW 18km/h', pressure: '1008 hPa', uvIndex: '10' }
  ])

  // 2. 浙江地级市数据集 (源自 zhejiang_weather_2026-04-17.json)
  const zhejiangCities = ref<City[]>([
    { id: 'hangzhou_city', name: '杭州市', pinyin: 'Hangzhou', parent: '浙江省', temp: 21, feelsLike: '21°C', weather: '薄雾 (Mist)', time: '11:58', weatherType: 'cloudy', humidity: '73%', wind: 'NNE 8km/h', pressure: '1015 hPa', uvIndex: '5' },
    { id: 'ningbo', name: '宁波市', pinyin: 'Ningbo', parent: '浙江省', temp: 22, feelsLike: '25°C', weather: '多云 (Partly cloudy)', time: '11:58', weatherType: 'cloudy', humidity: '65%', wind: 'NNW 16km/h', pressure: '1014 hPa', uvIndex: '6' },
    { id: 'wenzhou', name: '温州市', pinyin: 'Wenzhou', parent: '浙江省', temp: 24, feelsLike: '26°C', weather: '小雨 (Light drizzle)', time: '11:58', weatherType: 'rainy', humidity: '70%', wind: 'SE 5km/h', pressure: '1013 hPa', uvIndex: '7' }
  ])

  // 3. 杭州行政区数据集 (源自 hangzhou_weather_2026-04-17.json)
  const hangzhouDistricts = ref<City[]>([
    { id: 'shangcheng', name: '上城区', pinyin: 'Shangcheng', parent: '杭州市', temp: 22, feelsLike: '25°C', weather: '雾霾 (Haze)', time: '11:51', weatherType: 'cloudy', humidity: '65%', wind: 'NNE 8km/h', pressure: '1014 hPa', uvIndex: '5' },
    { id: 'xihu', name: '西湖区', pinyin: 'Xihu', parent: '杭州市', temp: 22, feelsLike: '25°C', weather: '雾霾 (Haze)', time: '11:51', weatherType: 'cloudy', humidity: '69%', wind: 'NNE 8km/h', pressure: '1014 hPa', uvIndex: '5' }
  ])

  // 根据当前模式选择数据集
  const cities = computed(() => {
    if (mode.value === 'china') return chinaCities.value
    if (mode.value === 'zhejiang') return zhejiangCities.value
    return hangzhouDistricts.value
  })

  // 根据当前 ID 计算具体展示哪座城市的数据
  const currentCity = computed(() => 
    cities.value.find(c => c.id === currentCityId.value) || cities.value[0]
  )

  // 自动定位状态
  const isLocating = ref(false)

  // 动作：选择城市
  function selectCity(id: string) {
    currentCityId.value = id
  }

  // 动作：切换数据集模式
  function setMode(newMode: DatasetMode) {
    mode.value = newMode
    // 切换模式时自动选中该模式下的首个城市
    currentCityId.value = cities.value[0].id
  }

  // 核心动作：全自动地理位置发现
  async function autoDetectLocation() {
    isLocating.value = true
    try {
      // 1. 优先尝试 IP 定位 (无弹窗，体验最佳)
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      const detectedCity = data.city // 例如 "Hangzhou" 或 "Beijing"

      if (detectedCity) {
        // 2. 在本地数据集中进行模糊匹配
        const allAvailableCities = [...chinaCities.value, ...zhejiangCities.value, ...hangzhouDistricts.value]
        const match = allAvailableCities.find(c => 
          detectedCity.toLowerCase().includes(c.pinyin.toLowerCase()) || 
          c.pinyin.toLowerCase().includes(detectedCity.toLowerCase())
        )

        if (match) {
          // 匹配成功：自动切换数据集模式并选中城市
          if (chinaCities.value.some(c => c.id === match.id)) mode.value = 'china'
          else if (zhejiangCities.value.some(c => c.id === match.id)) mode.value = 'zhejiang'
          else mode.value = 'hangzhou'
          
          currentCityId.value = match.id
          console.log(`[定位成功] 已自动匹配到: ${match.name}`)
        }
      }
    } catch (error) {
      console.error('[定位失败]', error)
      // 降级方案：可以尝试 navigator.geolocation，此处为保持极致体验暂不强制弹窗
    } finally {
      // 延迟关闭定位状态，确保 UI 反馈顺滑
      setTimeout(() => { isLocating.value = false }, 1000)
    }
  }

  return {
    mode,
    cities,
    currentCityId,
    currentCity,
    isLocating,
    selectCity,
    setMode,
    autoDetectLocation
  }
})
