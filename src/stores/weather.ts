import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 天气背景类型：晴天、雨天、阴天、雪天、雷阵雨、雾、霾、大雾
export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'thunderstorm' | 'overcast' | 'foggy' | 'mist' | 'haze'

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
  visibility: string
  stats: {
    humidity: string
    wind: string
    visibility: string
    uv: string
  }
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

  // 1. 全国核心城市数据集 (2026-04-21)
  const chinaCities = ref<City[]>([
    {
      id: 'beijing', name: '北京市', pinyin: 'Beijing', parent: '中国', province: '北京', temp: 24, feelsLike: '25°C', weather: '晴朗 (Sunny)', time: '14:41', weatherType: 'sunny',
      humidity: '35%', wind: 'W 15km/h', pressure: '1010 hPa', uvIndex: '8', visibility: '15km',
      stats: { humidity: '35%', wind: '15km/h', visibility: '15km', uv: '8' },
      hourlyForecast: [{ time: '14:00', temp: 24, weather: 'Sunny', humidity: '35%' }, { time: '17:00', temp: 22, weather: 'Sunny', humidity: '40%' }]
    },
    {
      id: 'shanghai', name: '上海市', pinyin: 'Shanghai', parent: '中国', province: '上海', temp: 22, feelsLike: '22°C', weather: '阴天 (Overcast)', time: '14:41', weatherType: 'overcast',
      humidity: '82%', wind: 'SE 12km/h', pressure: '1012 hPa', uvIndex: '3', visibility: '8km',
      stats: { humidity: '82%', wind: '12km/h', visibility: '8km', uv: '3' },
      hourlyForecast: [{ time: '14:00', temp: 22, weather: 'Overcast', humidity: '82%' }, { time: '17:00', temp: 21, weather: 'Cloudy', humidity: '85%' }]
    },
    {
      id: 'guangzhou', name: '广州市', pinyin: 'Guangzhou', parent: '中国', province: '广东', temp: 25, feelsLike: '28°C', weather: '小雨 (Light rain)', time: '14:41', weatherType: 'rainy',
      humidity: '94%', wind: 'S 8km/h', pressure: '1011 hPa', uvIndex: '2', visibility: '5km',
      stats: { humidity: '94%', wind: '8km/h', visibility: '5km', uv: '2' }
    },
    { id: 'shenzhen', name: '深圳市', pinyin: 'Shenzhen', parent: '中国', province: '广东', temp: 26, feelsLike: '29°C', weather: '小雨 (Light rain)', time: '14:41', weatherType: 'rainy', humidity: '89%', wind: 'S 10km/h', pressure: '1010 hPa', uvIndex: '2', visibility: '6km', stats: { humidity: '89%', wind: '10km/h', visibility: '6km', uv: '2' } },
    { id: 'chengdu', name: '成都市', pinyin: 'Chengdu', parent: '中国', province: '四川', temp: 23, feelsLike: '24°C', weather: '多云 (Partly cloudy)', time: '14:41', weatherType: 'cloudy', humidity: '65%', wind: 'E 5km/h', pressure: '1014 hPa', uvIndex: '6', visibility: '12km', stats: { humidity: '65%', wind: '5km/h', visibility: '12km', uv: '6' } },
    { id: 'chongqing', name: '重庆市', pinyin: 'Chongqing', parent: '中国', province: '重庆', temp: 27, feelsLike: '29°C', weather: '多云 (Cloudy)', time: '14:41', weatherType: 'cloudy', humidity: '72%', wind: 'NE 8km/h', pressure: '1012 hPa', uvIndex: '5', visibility: '10km', stats: { humidity: '72%', wind: '8km/h', visibility: '10km', uv: '5' } },
    { id: 'wuhan', name: '武汉市', pinyin: 'Wuhan', parent: '中国', province: '湖北', temp: 25, feelsLike: '26°C', weather: '晴朗 (Sunny)', time: '14:41', weatherType: 'sunny', humidity: '45%', wind: 'SE 12km/h', pressure: '1012 hPa', uvIndex: '9', visibility: '15km', stats: { humidity: '45%', wind: '12km/h', visibility: '15km', uv: '9' } },
    { id: 'xian', name: '西安市', pinyin: 'Xian', parent: '中国', province: '陕西', temp: 26, feelsLike: '26°C', weather: '晴朗 (Sunny)', time: '14:41', weatherType: 'sunny', humidity: '30%', wind: 'NE 14km/h', pressure: '1013 hPa', uvIndex: '8', visibility: '20km', stats: { humidity: '30%', wind: '14km/h', visibility: '20km', uv: '8' } },
    { id: 'harbin', name: '哈尔滨市', pinyin: 'Harbin', parent: '中国', province: '黑龙江', temp: 12, feelsLike: '10°C', weather: '阴天 (Overcast)', time: '14:41', weatherType: 'overcast', humidity: '42%', wind: 'S 18km/h', pressure: '1009 hPa', uvIndex: '4', visibility: '10km', stats: { humidity: '42%', wind: '18km/h', visibility: '10km', uv: '4' } },
    { id: 'kunming', name: '昆明市', pinyin: 'Kunming', parent: '中国', province: '云南', temp: 22, feelsLike: '22°C', weather: '晴朗 (Sunny)', time: '14:41', weatherType: 'sunny', humidity: '38%', wind: 'SW 20km/h', pressure: '1008 hPa', uvIndex: '10', visibility: '20km', stats: { humidity: '38%', wind: '20km/h', visibility: '20km', uv: '10' } }
  ])

  // 2. 浙江地级市数据集 (2026-04-21)
  const zhejiangCities = ref<City[]>([
    { id: 'hangzhou_city', name: '杭州市', pinyin: 'Hangzhou', parent: '浙江省', temp: 23, feelsLike: '23°C', weather: '阴天 (Overcast)', time: '14:41', weatherType: 'overcast', humidity: '78%', wind: 'SE 10km/h', pressure: '1013 hPa', uvIndex: '4', visibility: '8km', stats: { humidity: '78%', wind: '10km/h', visibility: '8km', uv: '4' } },
    { id: 'ningbo', name: '宁波市', pinyin: 'Ningbo', parent: '浙江省', temp: 24, feelsLike: '24°C', weather: '阴天 (Overcast)', time: '14:41', weatherType: 'overcast', humidity: '75%', wind: 'SE 12km/h', pressure: '1012 hPa', uvIndex: '4', visibility: '10km', stats: { humidity: '75%', wind: '12km/h', visibility: '10km', uv: '4' } },
    { id: 'wenzhou', name: '温州市', pinyin: 'Wenzhou', parent: '浙江省', temp: 25, feelsLike: '26°C', weather: '阵雨 (Showers)', time: '14:41', weatherType: 'rainy', humidity: '85%', wind: 'S 8km/h', pressure: '1011 hPa', uvIndex: '3', visibility: '6km', stats: { humidity: '85%', wind: '8km/h', visibility: '6km', uv: '3' } }
  ])

  // 3. 杭州行政区数据集 (2026-04-21)
  const hangzhouDistricts = ref<City[]>([
    { id: 'shangcheng', name: '上城区', pinyin: 'Shangcheng', parent: '杭州市', temp: 23, feelsLike: '23°C', weather: '阴天 (Overcast)', time: '14:41', weatherType: 'overcast', humidity: '78%', wind: 'SE 10km/h', pressure: '1013 hPa', uvIndex: '4', visibility: '8km', stats: { humidity: '78%', wind: '10km/h', visibility: '8km', uv: '4' } },
    { id: 'xihu', name: '西湖区', pinyin: 'Xihu', parent: '杭州市', temp: 23, feelsLike: '23°C', weather: '浓雾 (Foggy)', time: '14:41', weatherType: 'foggy', humidity: '92%', wind: 'E 5km/h', pressure: '1013 hPa', uvIndex: '1', visibility: '1km', stats: { humidity: '92%', wind: '5km/h', visibility: '1km', uv: '1' } }
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

  // 核心动作：全自动地理位置发现 (支持 IP 定位与原生地理位置兜底)
  async function autoDetectLocation(isManual = false) {
    if (isLocating.value) return // 防止并发触发
    isLocating.value = true
    
    console.log(`[定位] 触发方式: ${isManual ? '手动' : '自动'}`)

    // 内部帮助函数：执行城市匹配逻辑
    const performMatch = (detectedName: string) => {
      const allAvailableCities = [...chinaCities.value, ...zhejiangCities.value, ...hangzhouDistricts.value]
      const match = allAvailableCities.find(c => 
        detectedName.toLowerCase().includes(c.pinyin.toLowerCase()) || 
        c.pinyin.toLowerCase().includes(detectedName.toLowerCase()) ||
        detectedName.includes(c.name) ||
        c.name.includes(detectedName)
      )

      if (match) {
        // 匹配成功：自动切换数据集模式并选中城市
        if (chinaCities.value.some(c => c.id === match.id)) mode.value = 'china'
        else if (zhejiangCities.value.some(c => c.id === match.id)) mode.value = 'zhejiang'
        else mode.value = 'hangzhou'
        
        currentCityId.value = match.id
        console.log(`[定位成功] 已匹配到本地数据: ${match.name}`)
        return true
      }
      return false
    }

    try {
      // 1. 如果是手动点击，可以尝试触发浏览器原生地理位置 (会弹出权限申请)
      if (isManual && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
          })
          console.log(`[系统定位] 成功获取坐标: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`)
          // 注意：此处拿到坐标后通常需要高德/百度逆地理编码，
          // 在本 Demo 中我们继续通过 IP 接口获取城市名称进行数据展示
        } catch (geoError) {
          console.warn('[系统定位] 权限拒绝或超时，改用 IP 定位', geoError)
        }
      }

      // 2. 尝试 IP 定位 (无弹窗，体验极佳)
      const res = await fetch('https://ipapi.co/json/')
      if (!res.ok) throw new Error('定位服务响应异常')
      const data = await res.json()
      const detectedCity = data.city // 例如 "Hangzhou" 或 "Beijing"

      if (detectedCity) {
        const isMatched = performMatch(detectedCity)
        if (!isMatched) {
          console.warn(`[定位反馈] 已确认您的位置为 ${detectedCity}，但当前演示数据库仅支持部分核心城市。`)
        }
      } else {
         console.warn('[定位反馈] 接口未能识别明确的城市信息')
      }
    } catch (error) {
      console.error('[定位失败]', error)
    } finally {
      // 延迟关闭定位状态，确保 UI 上的“同步中”提示有足够的展示时间
      setTimeout(() => { isLocating.value = false }, isManual ? 1200 : 600)
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
