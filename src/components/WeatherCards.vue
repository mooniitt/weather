<script setup lang="ts">
import { useWeatherStore } from '../stores/weather'
import { storeToRefs } from 'pinia'

const weatherStore = useWeatherStore()
const { currentCity } = storeToRefs(weatherStore)

// 根据天气状况获取对应的 Material Design 图标
const getIcon = (condition: string) => {
  const lower = condition.toLowerCase()
  if (lower.includes('cloud') || lower.includes('cloudy') || lower.includes('多云') || lower.includes('阴') || lower.includes('overcast')) return 'cloud'
  if (lower.includes('rain') || lower.includes('雨')) return 'rainy'
  if (lower.includes('sunny') || lower.includes('clear') || lower.includes('晴')) return 'wb_sunny'
  if (lower.includes('snow') || lower.includes('雪')) return 'ac_unit'
  if (lower.includes('haze') || lower.includes('mist') || lower.includes('雾')) return 'blur_on'
  return 'cloud'
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-5 w-full max-w-7xl mx-auto pb-12">
    
    <!-- 每小时预报面板 -->
    <div 
      v-if="currentCity?.hourlyForecast && currentCity.hourlyForecast.length > 0"
      class="glass-panel p-6 rounded-[32px] col-span-full shadow-2xl"
    >
      <div class="flex items-center gap-2 text-white/30 text-[12px] font-bold uppercase tracking-widest mb-6 px-2">
        <span class="material-symbols-outlined text-[18px]">schedule</span>
        <span>每小时预报</span>
      </div>
      <div class="flex gap-8 overflow-x-auto no-scrollbar py-2 px-2">
        <div 
          v-for="(h, i) in currentCity.hourlyForecast" 
          :key="i"
          class="flex flex-col items-center min-w-[4.5rem] gap-4 group cursor-default"
        >
          <span class="text-[13px] font-medium text-white/50 group-hover:text-white transition-colors">{{ h.time }}</span>
          <span class="material-symbols-outlined text-white text-[32px] opacity-90 group-hover:scale-110 transition-transform">{{ getIcon(h.weather || h.condition) }}</span>
          <span class="text-[20px] font-bold text-white">{{ h.temp }}°</span>
        </div>
      </div>
    </div>

    <!-- 湿度卡片 -->
    <div 
      v-if="currentCity?.humidity"
      class="p-6 rounded-[32px] glass-panel flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 min-h-[160px]"
    >
      <div class="flex items-center gap-3 text-white/40 mb-4">
        <span class="material-symbols-outlined text-[20px]">water_drop</span>
        <span class="text-[13px] font-bold uppercase tracking-wider">湿度</span>
      </div>
      <div class="flex flex-col">
        <span class="text-4xl font-light text-white mb-2">{{ currentCity.humidity }}</span>
        <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div class="h-full bg-sky-400 rounded-full" :style="{ width: currentCity.humidity }"></div>
        </div>
      </div>
    </div>

    <!-- 紫外线指数卡片 -->
    <div 
      v-if="currentCity?.uvIndex"
      class="p-6 rounded-[32px] glass-panel flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 min-h-[160px]"
    >
      <div class="flex items-center gap-3 text-white/40 mb-4">
        <span class="material-symbols-outlined text-[20px]">wb_sunny</span>
        <span class="text-[13px] font-bold uppercase tracking-wider">紫外线指数</span>
      </div>
      <div class="flex flex-col">
        <span class="text-4xl font-light text-white mb-2">{{ currentCity.uvIndex }}</span>
        <span class="text-[13px] font-medium text-white/60">
          {{ Number(currentCity.uvIndex) > 5 ? '强度：高' : '强度：适中' }}
        </span>
      </div>
    </div>

    <!-- 气压卡片 -->
    <div 
      v-if="currentCity?.pressure"
      class="p-6 rounded-[32px] glass-panel flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 min-h-[160px]"
    >
      <div class="flex items-center gap-3 text-white/40 mb-4">
        <span class="material-symbols-outlined text-[20px]">compress</span>
        <span class="text-[13px] font-bold uppercase tracking-wider">气压</span>
      </div>
      <div class="flex flex-col">
        <span class="text-3xl font-light text-white">{{ currentCity.pressure }}</span>
      </div>
    </div>

    <!-- 风速卡片 -->
    <div 
      v-if="currentCity?.wind"
      class="p-6 rounded-[32px] glass-panel flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 min-h-[160px]"
    >
      <div class="flex items-center gap-3 text-white/40 mb-4">
        <span class="material-symbols-outlined text-[20px]">air</span>
        <span class="text-[13px] font-bold uppercase tracking-wider">风速</span>
      </div>
      <div class="flex flex-col">
        <span class="text-3xl font-light text-white">{{ currentCity.wind }}</span>
      </div>
    </div>

    <!-- 能见度卡片 -->
    <div 
      v-if="currentCity?.visibility"
      class="p-6 rounded-[32px] glass-panel flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 min-h-[160px]"
    >
      <div class="flex items-center gap-3 text-white/40 mb-4">
        <span class="material-symbols-outlined text-[20px]">visibility</span>
        <span class="text-[13px] font-bold uppercase tracking-wider">能见度</span>
      </div>
      <div class="flex flex-col">
        <span class="text-3xl font-light text-white mb-1">{{ currentCity.visibility }}</span>
        <span class="text-[13px] font-medium text-white/60">当前能见度良好。</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 样式主要位于 main.css */
</style>
