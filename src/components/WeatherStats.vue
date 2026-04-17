<script setup lang="ts">
import { useWeatherStore, type City } from '../stores/weather'
import { storeToRefs } from 'pinia'

const weatherStore = useWeatherStore()
const { currentCity } = storeToRefs(weatherStore)

const statsList = [
  { key: 'humidity', label: '湿度', icon: 'water_drop' },
  { key: 'wind', label: '风速', icon: 'air' },
  { key: 'visibility', label: '能见度', icon: 'visibility' },
  { key: 'uv', label: '紫外线指数', icon: 'wb_sunny' }
]
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
    <div
      v-for="stat in statsList"
      :key="stat.key"
      class="flex flex-col p-5 rounded-3xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl"
    >
      <div class="flex items-center gap-2 text-white/70 mb-3">
        <span class="material-symbols-outlined text-[20px]">{{ stat.icon }}</span>
        <span class="text-xs font-bold uppercase tracking-widest">{{ stat.label }}</span>
      </div>
      <p class="text-2xl font-bold text-white">
        {{ currentCity.stats[stat.key as keyof City['stats']] }}
      </p>
    </div>
  </div>
</template>
