<script setup lang="ts">
import { useRouter } from 'vue-router'
import ThreeWeather from '../components/ThreeWeather.vue'
import { ref } from 'vue'

const router = useRouter()

// Interactive testing state (can be removed later or kept for demo)
const currentWeather = ref<'sunny' | 'rainy' | 'cloudy' | 'snowy'>('sunny')

const stats = [
  { label: 'Humidity', val: '45%', sub: 'Dew point is 12°', icon: 'water_drop' },
  { label: 'Wind', val: '12', unit: 'km/h', sub: 'NW', icon: 'air', subIcon: 'navigation' },
  { label: 'Visibility', val: '10', unit: 'km', sub: 'Perfect view', icon: 'visibility' },
  { label: 'UV Index', val: '4', unit: 'Mod', sub: 'Low risk', icon: 'wb_sunny', bar: 40 },
]

const hourlyForecast = [
  { t: '1 PM', i: 'wb_sunny', v: '25°', color: 'text-yellow-300' },
  { t: '2 PM', i: 'partly_cloudy_day', v: '26°' },
  { t: '3 PM', i: 'cloud', v: '25°' },
  { t: '4 PM', i: 'rainy', v: '22°', color: 'text-blue-200' },
]

const dailyForecast = [
  { d: 'Today', i: 'wb_sunny', w: 'Sunny', h: 28, l: 18, color: 'text-yellow-300' },
  { d: 'Tue', i: 'partly_cloudy_day', w: 'Cloudy', h: 26, l: 19 },
  { d: 'Wed', i: 'rainy', w: 'Rain', h: 22, l: 17, color: 'text-blue-200' },
]

function cycleWeather() {
  const types: ('sunny' | 'rainy' | 'cloudy' | 'snowy')[] = ['sunny', 'rainy', 'cloudy', 'snowy']
  const currentIndex = types.indexOf(currentWeather.value)
  currentWeather.value = types[(currentIndex + 1) % types.length]
}
</script>

<template>
  <div
    class="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl text-white font-display antialiased bg-black"
  >
    <!-- Three.js Weather Background -->
    <ThreeWeather :weatherType="currentWeather" />

    <header class="sticky top-0 z-20 flex items-center justify-between p-4 pt-6">
      <div
        @click="cycleWeather"
        class="flex items-center gap-2 cursor-pointer group hover:bg-white/10 p-2 rounded-lg transition-colors z-30"
      >
        <span
          class="material-symbols-outlined text-white group-hover:scale-110 transition-transform drop-shadow-md"
          >location_on</span
        >
        <h2
          class="text-lg font-bold leading-tight tracking-tight truncate max-w-[200px] text-shadow-sm"
        >
          Beijing, Haidian District
        </h2>
      </div>
      <button
        class="flex items-center justify-center size-10 rounded-full hover:bg-white/20 transition-colors"
      >
        <span class="material-symbols-outlined text-white">segment</span>
      </button>
    </header>

    <main class="flex-1 flex flex-col gap-6 px-4 pb-24 relative z-10">
      <div class="flex flex-col items-center justify-center pt-6 pb-2">
        <div class="relative mb-4">
          <div class="sun-rays"></div>
          <span
            class="material-symbols-outlined text-[140px] leading-none text-yellow-300 relative z-10 drop-shadow-lg animate-spin-slow"
            style="
              font-variation-settings:
                'FILL' 1,
                'wght' 200;
            "
            >wb_sunny</span
          >
        </div>
        <div class="flex flex-col items-center gap-1">
          <h1 class="text-[90px] font-bold leading-none tracking-tighter text-white drop-shadow-lg">
            24°
          </h1>
          <h2 class="text-3xl font-semibold tracking-wide mt-1 text-white/95 text-shadow-sm">
            Clear Sky
          </h2>
          <p class="text-white/80 font-medium text-lg">H: 28° &nbsp; L: 18°</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="flex flex-col p-4 rounded-2xl glass-card hover:bg-white/20 transition-colors"
        >
          <div class="flex items-center gap-2 text-white/70 mb-2">
            <span class="material-symbols-outlined text-[20px]">{{ stat.icon }}</span>
            <span class="text-xs font-semibold uppercase tracking-wider">{{ stat.label }}</span>
          </div>
          <p class="text-2xl font-bold">
            {{ stat.val }}
            <span v-if="stat.unit" class="text-sm font-medium text-white/60">{{ stat.unit }}</span>
          </p>
          <div v-if="stat.bar" class="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
            <div
              :style="{ width: `${stat.bar}%` }"
              class="h-full bg-gradient-to-r from-green-300 to-yellow-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            ></div>
          </div>
          <div v-else class="flex items-center gap-1 mt-1 text-white/60">
            <span v-if="stat.subIcon" class="material-symbols-outlined text-[16px] rotate-45"
              >navigation</span
            >
            <span class="text-xs">{{ stat.sub }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Hourly Forecast
          </h3>
          <button class="text-sm font-medium text-white hover:text-white/80">See all</button>
        </div>
        <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
          <div
            class="flex flex-col items-center justify-between min-w-[72px] h-[110px] p-3 rounded-2xl bg-white/25 border border-white/40 shadow-glow backdrop-blur-md"
          >
            <span class="text-xs font-medium">Now</span>
            <span class="material-symbols-outlined text-[24px]">wb_sunny</span>
            <span class="text-lg font-bold">24°</span>
          </div>
          <div
            v-for="(h, i) in hourlyForecast"
            :key="i"
            class="flex flex-col items-center justify-between min-w-[72px] h-[110px] p-3 rounded-2xl glass-card"
          >
            <span class="text-xs font-medium text-white/70">{{ h.t }}</span>
            <span :class="`material-symbols-outlined text-[24px] ${h.color || 'text-white/80'}`">{{
              h.i
            }}</span>
            <span class="text-lg font-bold">{{ h.v }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider px-1">
          Next 3 Days
        </h3>
        <div class="flex flex-col gap-2 rounded-2xl glass-card p-4">
          <div
            v-for="(d, i) in dailyForecast"
            :key="i"
            class="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
          >
            <span class="font-medium w-16">{{ d.d }}</span>
            <div class="flex items-center gap-2 flex-1 justify-center">
              <span :class="`material-symbols-outlined ${d.color || 'text-white/80'}`">{{
                d.i
              }}</span>
              <span class="text-sm text-white/80">{{ d.w }}</span>
            </div>
            <div class="flex items-center gap-3 w-20 justify-end">
              <span class="font-bold">{{ d.h }}°</span>
              <span class="text-white/60">{{ d.l }}°</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <nav class="fixed bottom-0 left-0 right-0 z-50 glass-nav pb-safe">
      <div class="flex items-center justify-around h-16 max-w-md mx-auto">
        <button
          class="flex flex-col items-center justify-center gap-1 text-white w-16 drop-shadow-md"
        >
          <span class="material-symbols-outlined filled" style="font-variation-settings: 'FILL' 1"
            >home</span
          >
          <span class="text-[10px] font-medium">Home</span>
        </button>
        <button
          class="flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white transition-colors w-16"
        >
          <span class="material-symbols-outlined">search</span>
          <span class="text-[10px] font-medium">Search</span>
        </button>
        <button
          class="flex flex-col items-center justify-center gap-1 text-white/60 hover:text-white transition-colors w-16"
        >
          <span class="material-symbols-outlined">settings</span>
          <span class="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </nav>
  </div>
</template>
