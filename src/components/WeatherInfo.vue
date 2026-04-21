<script setup lang="ts">
import { useWeatherStore } from '../stores/weather'
import { storeToRefs } from 'pinia'

const weatherStore = useWeatherStore()
const { currentCity } = storeToRefs(weatherStore)
</script>

<template>
  <div class="flex flex-col items-center lg:items-start justify-center text-white py-12 md:py-16">
    <!-- 地理位置交互区域 -->
    <div 
      @click="weatherStore.autoDetectLocation(true)"
      class="group cursor-pointer flex flex-col items-center lg:items-start transition-all active:scale-95 active:opacity-70"
      title="点击重新定位"
    >
      <div class="flex items-center gap-2 mb-1 opacity-60 font-bold text-sm tracking-widest uppercase group-hover:text-sky-400 transition-colors">
        <span class="material-symbols-outlined text-sm group-hover:animate-pulse">location_on</span>
        <span>{{ currentCity?.parent }}</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-semibold drop-shadow-lg mb-1 tracking-tight group-hover:translate-x-1 transition-transform duration-700">
        {{ currentCity?.name }}
      </h2>
    </div>
    <h1 class="text-[96px] md:text-[120px] font-thin leading-none tracking-tighter drop-shadow-2xl">
      {{ currentCity?.temp }}°
    </h1>
    <p class="text-xl md:text-2xl font-light opacity-80 mt-2">
      {{ currentCity?.weather }}
    </p>
    <div class="flex flex-col items-center lg:items-start mt-2 group">
      <div 
        v-if="currentCity?.feelsLike"
        class="text-lg md:text-xl font-medium opacity-70 backdrop-blur-sm px-4 lg:px-0 py-1"
      >
         体感温度 {{ currentCity.feelsLike }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 继承全局 Apple 字体栈，仅保留极致纤细的字重设置 */
h1 {
  font-weight: 200;
}
</style>
