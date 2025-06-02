<script setup lang="ts">
import ThreeCanvas from '@/components/ThreeCanvas.vue'
import { ref, onMounted } from 'vue'

const position = ref<GeolocationPosition | null>(null)
const error = ref<string>('')

const getLocation = () => {
  if (!navigator.geolocation) {
    error.value = '您的浏览器不支持地理位置'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      position.value = pos
      console.log('当前位置：', pos.coords.latitude, pos.coords.longitude)
    },
    (err) => {
      error.value = `获取位置失败: ${err.message}`
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    },
  )
}

onMounted(() => {
  getLocation()
})
</script>

<template>
  <div class="relative">
    <div class="left-side">
      <div class="location-info">
        <h3 class="text-xl mb-2">位置信息</h3>
        <p v-if="position">
          纬度: {{ position.coords.latitude.toFixed(4) }}°<br />
          经度: {{ position.coords.longitude.toFixed(4) }}°
        </p>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="!position && !error" class="loading">正在获取位置...</p>
      </div>
    </div>
    <div class="number-container">
      <h1 class="number">
        <span>24</span>
        <span class="unit">°C</span>
      </h1>
    </div>
    <!-- <ThreeCanvas /> -->
  </div>
</template>

<style scoped lang="scss">
.number-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
}
.number {
  margin: 0;
  font-size: 400px;
  color: rgba(0, 0, 0, 0.8);
  padding: 40px 100px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(12px);
  border-radius: 32px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow:
      0 15px 45px rgba(0, 0, 0, 0.2),
      inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  }

  .unit {
    font-size: 0.4em;
    margin-left: 10px;
    vertical-align: super;
  }
}
.left-side {
  position: absolute;
  left: 40px;
  top: 40px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 10;

  .location-info {
    color: rgba(0, 0, 0, 0.8);

    .error-message {
      color: #dc2626;
    }

    .loading {
      color: #666;
    }
  }
}
</style>
