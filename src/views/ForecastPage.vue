<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const view = ref<'hourly' | 'daily'>('hourly')

const hourlyData = [
  { t: '14:00', i: 'air', v: '23°' },
  { t: '15:00', i: 'cloud', v: '22°' },
  { t: '16:00', i: 'rainy', v: '20°' },
  { t: '17:00', i: 'ac_unit', v: '2°' },
  { t: '18:00', i: 'thunderstorm', v: '5°' },
]

const weeklyData = [
  { day: 'Today', icon: 'sunny', color: 'amber', high: 28, low: 18 },
  { day: 'Tue', icon: 'rainy', color: 'blue', high: 22, low: 16, pop: '60%' },
  { day: 'Wed', icon: 'air', color: 'stone', high: 20, low: 15 },
  { day: 'Thu', icon: 'ac_unit', color: 'sky', high: 3, low: -2 },
  { day: 'Fri', icon: 'cloud', color: 'slate', high: 10, low: 4 },
]
</script>

<template>
  <div
    class="relative flex flex-col w-full max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden"
  >
    <header
      class="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md"
    >
      <button
        @click="router.push('/current')"
        class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <span class="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
      </button>
      <div class="flex flex-col items-center">
        <h2 class="text-lg font-bold leading-tight">Shanghai</h2>
        <div class="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span class="material-symbols-outlined text-[14px]">location_on</span>
          <span>Current Location</span>
        </div>
      </div>
      <button
        class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <span class="material-symbols-outlined text-[24px]">add_circle</span>
      </button>
    </header>

    <main class="flex-1 flex flex-col pb-6">
      <section class="flex flex-col items-center pt-6 pb-8 px-4">
        <div
          class="flex items-center justify-center w-24 h-24 mb-4 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full shadow-lg shadow-orange-500/20"
        >
          <span class="material-symbols-outlined text-white text-[64px] drop-shadow-md">sunny</span>
        </div>
        <h1 class="text-6xl font-light tracking-tighter mb-2">24°</h1>
        <p class="text-xl font-medium text-slate-600 dark:text-slate-300">Mostly Sunny</p>
        <div class="flex gap-4 mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <span>H: 28°</span>
          <span>L: 18°</span>
        </div>
      </section>

      <section class="px-4 mb-6">
        <div class="flex p-1 bg-slate-200 dark:bg-[#1c2a38] rounded-xl relative">
          <label class="flex-1 relative cursor-pointer">
            <input
              type="radio"
              class="sr-only peer"
              name="forecast-view"
              :checked="view === 'hourly'"
              @change="view = 'hourly'"
            />
            <div
              class="flex items-center justify-center py-2 rounded-lg text-sm font-semibold transition-all duration-300 text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-primary peer-checked:text-primary dark:peer-checked:text-white peer-checked:shadow-sm"
            >
              Hourly
            </div>
          </label>
          <label class="flex-1 relative cursor-pointer">
            <input
              type="radio"
              class="sr-only peer"
              name="forecast-view"
              :checked="view === 'daily'"
              @change="view = 'daily'"
            />
            <div
              class="flex items-center justify-center py-2 rounded-lg text-sm font-semibold transition-all duration-300 text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-primary peer-checked:text-primary dark:peer-checked:text-white peer-checked:shadow-sm"
            >
              Daily
            </div>
          </label>
        </div>
      </section>

      <section class="mb-2 px-4">
        <div
          class="bg-white dark:bg-[#17222c] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
        >
          <div class="flex justify-between items-end mb-6">
            <div>
              <p
                class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1"
              >
                Temperature Trend
              </p>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold">Rising</span>
                <span class="text-sm text-slate-500 dark:text-slate-400">until 16:00</span>
              </div>
            </div>
            <div class="flex gap-2">
              <span
                class="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-xs font-bold flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[14px]">water_drop</span> 12%
              </span>
            </div>
          </div>
          <div class="relative w-full h-[120px] mb-6">
            <svg
              class="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 360 120"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#2b8cee" stop-opacity="0.4"></stop>
                  <stop offset="100%" stop-color="#2b8cee" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
              <line
                stroke="currentColor"
                stroke-dasharray="4 4"
                stroke-opacity="0.05"
                x1="0"
                x2="360"
                y1="0"
                y2="0"
              ></line>
              <line
                stroke="currentColor"
                stroke-dasharray="4 4"
                stroke-opacity="0.05"
                x1="0"
                x2="360"
                y1="60"
                y2="60"
              ></line>
              <line
                stroke="currentColor"
                stroke-dasharray="4 4"
                stroke-opacity="0.05"
                x1="0"
                x2="360"
                y1="120"
                y2="120"
              ></line>
              <path
                d="M0,80 C40,80 60,40 100,40 C140,40 160,20 200,20 C240,20 280,50 320,50 C340,50 360,70 360,70 V120 H0 Z"
                fill="url(#chartGradient)"
              ></path>
              <path
                d="M0,80 C40,80 60,40 100,40 C140,40 160,20 200,20 C240,20 280,50 320,50 C340,50 360,70 360,70"
                fill="none"
                stroke="#2b8cee"
                stroke-linecap="round"
                stroke-width="3"
              ></path>
              <circle
                class="fill-background-light dark:fill-background-dark stroke-primary"
                cx="100"
                cy="40"
                r="4"
                stroke-width="2"
              ></circle>
              <circle
                class="fill-background-light dark:fill-background-dark stroke-primary"
                cx="200"
                cy="20"
                r="4"
                stroke-width="2"
              ></circle>
              <circle
                class="fill-background-light dark:fill-background-dark stroke-primary"
                cx="320"
                cy="50"
                r="4"
                stroke-width="2"
              ></circle>
            </svg>
          </div>
          <div class="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-2 px-2">
            <div
              class="flex flex-col items-center gap-2 min-w-[4rem] p-3 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-100 ring-2 ring-amber-400/50 dark:ring-amber-500/30 shadow-lg shadow-amber-500/10"
            >
              <span class="text-xs font-bold">Now</span>
              <span class="material-symbols-outlined text-[24px]">sunny</span>
              <span class="text-sm font-bold">24°</span>
            </div>
            <div
              v-for="(h, i) in hourlyData"
              :key="i"
              class="flex flex-col items-center gap-2 min-w-[4rem] p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
            >
              <span class="text-xs font-medium opacity-80">{{ h.t }}</span>
              <span class="material-symbols-outlined text-[24px]">{{ h.i }}</span>
              <span class="text-sm font-bold">{{ h.v }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="flex-1 px-4 mt-4">
        <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">calendar_month</span>
          7-Day Forecast
        </h3>
        <div class="flex flex-col gap-3">
          <div
            v-for="(d, i) in weeklyData"
            :key="i"
            :class="`flex items-center justify-between p-4 rounded-2xl bg-${d.color}-50 dark:bg-${d.color}-900/10 border border-${d.color}-100 dark:border-${d.color}-800/30 hover:bg-${d.color}-100 dark:hover:bg-${d.color}-900/20 transition-all cursor-pointer`"
          >
            <p class="text-base font-medium w-12 text-slate-900 dark:text-white">{{ d.day }}</p>
            <div class="flex flex-col items-center justify-center w-8">
              <span :class="`material-symbols-outlined text-${d.color}-500`">{{ d.icon }}</span>
              <span v-if="d.pop" class="text-[10px] font-bold text-blue-500 leading-none">{{
                d.pop
              }}</span>
            </div>
            <div class="flex-1 flex items-center justify-center px-4 gap-3">
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium w-6 text-right"
                >{{ d.low }}°</span
              >
              <div
                class="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden"
              >
                <div
                  :class="`absolute left-[20%] right-[10%] top-0 bottom-0 bg-gradient-to-r from-${d.color}-300 to-${d.color}-500 rounded-full`"
                ></div>
              </div>
              <span class="text-xs text-slate-900 dark:text-white font-bold w-6"
                >{{ d.high }}°</span
              >
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
