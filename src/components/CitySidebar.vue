<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWeatherStore } from '../stores/weather'
import { storeToRefs } from 'pinia'

const weatherStore = useWeatherStore()
const { cities, currentCityId, mode } = storeToRefs(weatherStore)

// 搜索栏输入绑定
const searchQuery = ref('')

// 根据搜索关键词过滤城市列表
const filteredCities = computed(() => {
  if (!searchQuery.value) return cities.value
  return cities.value.filter(city => 
    city.name.includes(searchQuery.value) || 
    city.parent.includes(searchQuery.value)
  )
})

// 选择城市事件
function onSelect(id: string) {
  weatherStore.selectCity(id)
}

// 获取天气对应的图标 (对接新数据字段 weather)
const getWeatherIcon = (weather: string) => {
  const lower = weather.toLowerCase()
  if (lower.includes('cloud') || lower.includes('多云') || lower.includes('阴')) return 'cloud'
  if (lower.includes('rain') || lower.includes('雨')) return 'rainy'
  if (lower.includes('sunny') || lower.includes('clear') || lower.includes('晴')) return 'wb_sunny'
  if (lower.includes('snow') || lower.includes('雪')) return 'ac_unit'
  return 'filter_drama'
}

// 根据天气类型动态设置氛围层的渐变色
const getAtmosphereClass = (type: string) => {
  switch (type) {
    case 'sunny': return 'bg-gradient-to-br from-yellow-400/30 to-orange-500/10'
    case 'rainy': return 'bg-gradient-to-br from-blue-600/30 to-indigo-900/10'
    case 'snowy': return 'bg-gradient-to-br from-slate-100/30 to-slate-400/10'
    case 'cloudy': return 'bg-gradient-to-br from-slate-400/30 to-slate-700/10'
    default: return 'bg-white/10'
  }
}
</script>

<template>
  <aside
    class="flex flex-col w-full h-full bg-[#0c0c0e]/80 backdrop-blur-[80px] border-r border-white/5 z-20 overflow-hidden"
  >
    <!-- 顶部标题区域 -->
    <div class="px-5 pt-8 pb-4">
      <h2 class="text-xl font-bold text-white tracking-tight flex items-center justify-between">
        地区选择
        <span class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">MAX-UI</span>
      </h2>
    </div>

    <!-- 数据集切换器 (扩展为三段式：全国 / 全省 / 杭州) -->
    <div class="px-5 pb-5">
      <div class="flex p-1 bg-white/[0.02] rounded-2xl border border-white/[0.05] backdrop-blur-3xl shadow-inner">
        <button 
          @click="weatherStore.setMode('china')"
          :class="[
            'flex-1 py-2 text-[12px] font-bold rounded-xl transition-all duration-500',
            mode === 'china' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white/40'
          ]"
        >
          全国
        </button>
        <button 
          @click="weatherStore.setMode('zhejiang')"
          :class="[
            'flex-1 py-2 text-[12px] font-bold rounded-xl transition-all duration-500',
            mode === 'zhejiang' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white/40'
          ]"
        >
          全省
        </button>
        <button 
          @click="weatherStore.setMode('hangzhou')"
          :class="[
            'flex-1 py-2 text-[12px] font-bold rounded-xl transition-all duration-500',
            mode === 'hangzhou' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white/40'
          ]"
        >
          杭州
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="px-5 pb-6">
      <div class="relative group">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[20px] group-focus-within:text-sky-400 transition-colors">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="探索目的地..."
          class="w-full h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl pl-12 pr-4 text-white text-[15px] placeholder:text-white/20 focus:bg-white/[0.05] focus:border-white/10 transition-all outline-none"
        />
      </div>
    </div>

    <!-- 城市列表 -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-5 pb-10 flex flex-col gap-5">
      <button
        v-for="city in filteredCities"
        :key="city.id"
        @click="onSelect(city.id)"
        :class="[
          'relative w-full h-[120px] rounded-[32px] overflow-hidden transition-all duration-700 group border',
          currentCityId === city.id 
            ? 'glass-card-selected scale-[0.98]' 
            : 'glass-card-max border-white/[0.03]'
        ]"
      >
        <div :class="['atmosphere-layer', getAtmosphereClass(city.weatherType)]"></div>
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(white 0.5px, transparent 0.5px); background-size: 16px 16px;"></div>

        <!-- 极致视觉内容层 -->
        <div class="relative z-10 p-4 pl-5 pr-5 flex items-center h-full gap-4">
          <!-- 左侧：地理与气象概览 (弹性填充) -->
          <div class="flex flex-col justify-center items-start text-left flex-1 min-w-0 py-1 gap-3">
             <div class="flex flex-col gap-0.5 w-full">
                <span class="text-[20px] font-bold text-white tracking-tight group-hover:translate-x-1.5 transition-transform duration-700 truncate w-full drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">
                  {{ city.name }}
                </span>
                <span class="text-[10px] font-extrabold text-white/30 uppercase tracking-[0.2em] truncate w-full">
                  {{ city.parent }}
                </span>
             </div>
             <div class="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-700">
                <span class="material-symbols-outlined text-[16px] text-white/50 group-hover:scale-125 group-hover:text-sky-400 transition-all duration-500">
                  {{ getWeatherIcon(city.weather) }}
                </span>
                <span class="text-[13px] font-medium text-white/70 truncate">{{ city.weather }}</span>
             </div>
          </div>

          <!-- 功能区极细分割线 (Retina Line) -->
          <div class="w-[1px] h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent shrink-0"></div>

          <!-- 右侧：核心气象数字 (极致排版) -->
          <div class="flex flex-col justify-center items-end shrink-0 text-right py-1 gap-1">
             <span class="text-[46px] font-thin leading-[0.8] tracking-tighter bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-1000 origin-right">
                {{ city.temp }}°
             </span>
             <span class="text-[10px] font-bold text-white/20 tracking-widest tabular-nums">{{ city.time }}</span>
          </div>
        </div>
      </button>
    </div>
  </aside>
</template>
