<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWeatherStore } from '../stores/weather'
import { storeToRefs } from 'pinia'
import CitySidebar from '../components/CitySidebar.vue'
import WeatherInfo from '../components/WeatherInfo.vue'
import WeatherCards from '../components/WeatherCards.vue'
import ThreeWeather from '../components/ThreeWeather.vue'

const weatherStore = useWeatherStore()
const { currentCity, isLocating } = storeToRefs(weatherStore)

// 页面初始化时执行自动定位
onMounted(() => {
  weatherStore.autoDetectLocation()
})

// 侧边栏开启状态
const isSidebarOpen = ref(false)

// 切换侧边栏状态
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="flex h-[100dvh] w-full bg-[#0a0a0c] overflow-hidden font-sans select-none text-white transition-colors duration-1000">
    <!-- 统一的悬浮侧边栏 -->
    <Transition
      enter-active-class="transition duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
      enter-from-class="-translate-x-full opacity-0 scale-95"
      enter-to-class="translate-x-0 opacity-100 scale-100"
      leave-active-class="transition duration-400 cubic-bezier(0.7, 0, 0.84, 0)"
      leave-from-class="translate-x-0 opacity-100 scale-100"
      leave-to-class="-translate-x-full opacity-0 scale-95"
    >
      <div 
        v-if="isSidebarOpen"
        class="fixed inset-0 z-[100] flex p-4 pointer-events-none"
      >
        <!-- 遮罩层：仅作为点击区域，视觉上移除全屏变暗，改为侧边阴影增强 -->
        <div class="absolute inset-0 pointer-events-auto cursor-pointer" @click="toggleSidebar"></div>
        
        <!-- 侧边栏主体：增加极致的深色边缘阴影 (Shadow-2xl + Custom Shadow) -->
        <div class="relative w-full max-w-[360px] h-full pointer-events-auto rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_1px_rgba(255,255,255,0.1)]">
          <CitySidebar 
            @select="isSidebarOpen = false" 
          />
        </div>
      </div>
    </Transition>

    <!-- 主内容区域 -->
    <main class="relative flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-gradient-to-b from-slate-900 to-black">
      <!-- 3D 天气背景层 -->
      <ThreeWeather 
        :weatherType="currentCity?.weatherType || 'sunny'" 
        class="absolute inset-0 pointer-events-none opacity-80"
      />

      <!-- 内容覆盖层 -->
      <div class="relative z-10 flex flex-col h-full overflow-y-auto no-scrollbar scroll-smooth">
        
        <!-- 顶部工具栏 -->
        <header class="flex items-center justify-between p-4 md:p-6 sticky top-0 z-20">
          <button
            @click="toggleSidebar"
            class="flex items-center justify-center size-12 rounded-2xl glass-panel text-white hover:scale-110 active:scale-95 transition-all"
          >
            <span class="material-symbols-outlined text-[24px]">menu</span>
          </button>
          
          <div class="hidden md:block"></div> <!-- 桌面端占位符 -->

          <div class="flex items-center gap-3">
             <button class="size-9 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
          </div>
        </header>

        <!-- 天气展示面板 -->
        <div class="flex-1 flex flex-col lg:flex-row lg:items-start lg:gap-12 px-4 md:px-8 pb-12 max-w-[1600px] mx-auto w-full">
          <!-- 左侧：当前天气概览 (吸顶) -->
          <div class="lg:w-1/3 lg:sticky lg:top-24 h-fit">
            <WeatherInfo />
          </div>
          
          <!-- 右侧：详情卡片网格 -->
          <div class="flex-1 lg:w-2/3">
            <WeatherCards />
          </div>
        </div>
      </div>
      
      <!-- 自动定位加载提示 (极致玻璃态 Toast) -->
      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="translate-y-12 opacity-0 scale-90"
        enter-to-class="translate-y-0 opacity-100 scale-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="translate-y-0 opacity-100 scale-100"
        leave-to-class="translate-y-12 opacity-0 scale-95"
      >
        <div 
          v-if="isLocating"
          class="absolute bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl glass-panel flex items-center gap-3 border-white/20 shadow-2xl"
        >
          <div class="size-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin"></div>
          <span class="text-[14px] font-medium text-white tracking-wide">正在同步您的地理位置...</span>
        </div>
      </Transition>

      <!-- 窗口控制装饰 (仿 Mac 风格) -->
      <div class="absolute top-4 left-4 z-50 flex gap-1.5 md:hidden">
        <div class="size-3 rounded-full bg-red-500/80"></div>
        <div class="size-3 rounded-full bg-yellow-500/80"></div>
        <div class="size-3 rounded-full bg-green-500/80"></div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 局部滚动条样式 */
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
