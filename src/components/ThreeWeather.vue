<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, toRefs } from 'vue'
import * as THREE from 'three'

// 接收天气类型 Props
const props = defineProps<{
  weatherType: 'sunny' | 'rainy' | 'cloudy' | 'snowy'
}>()

const { weatherType } = toRefs(props)
const container = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number
let weatherSystem: THREE.Object3D | null = null
let skyMesh: THREE.Mesh | null = null

// --- 纹理素材生成 ---
const cloudTexture = createCloudTexture()
const rainTexture = createDropTexture()
const snowTexture = createSnowTexture()
const sunTexture = createSunTexture()

// 初始化 3D 场景
function init() {
  if (!container.value) return

  scene = new THREE.Scene()

  // 设置摄像机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.z = 5

  // 设置渲染器
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  // 初始化天气系统
  updateWeather(weatherType.value)

  // 灯光效果
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 10, 7)
  scene.add(dirLight)

  window.addEventListener('resize', onWindowResize)
  animate()
}

// 处理窗口缩放
function onWindowResize() {
  if (!container.value || !camera || !renderer) return

  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

// 逐帧动画
function animate() {
  animationId = requestAnimationFrame(animate)

  const time = Date.now() * 0.001

  if (weatherSystem) {
    if (weatherType.value === 'rainy') {
      animateRain(weatherSystem as THREE.Points)
    } else if (weatherType.value === 'snowy') {
      animateSnow(weatherSystem as THREE.Points, time)
    } else if (weatherType.value === 'cloudy') {
      animateClouds(weatherSystem, time)
    } else if (weatherType.value === 'sunny') {
      animateSun(weatherSystem, time)
    }
  }

  // 动画化天空着色器
  if (skyMesh && skyMesh.material instanceof THREE.ShaderMaterial) {
    skyMesh.material.uniforms.uTime.value = time
  }

  renderer.render(scene, camera)
}

// --- 具体气象动画逻辑 ---

// 降雨动画
function animateRain(system: THREE.Points) {
  const positions = system.geometry.attributes.position.array as Float32Array
  const speed = 0.8

  for (let i = 1; i < positions.length; i += 3) {
    positions[i] -= speed
    if (positions[i] < -10) {
      positions[i] = 10
    }
  }
  system.geometry.attributes.position.needsUpdate = true
}

// 下雪动画
function animateSnow(system: THREE.Points, time: number) {
  const positions = system.geometry.attributes.position.array as Float32Array
  const speed = 0.02

  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] -= speed // 纵向移动
    positions[i] += Math.sin(time + positions[i + 1]) * 0.005 // 横向微晃
    if (positions[i + 1] < -10) {
      positions[i + 1] = 10
    }
  }
  system.geometry.attributes.position.needsUpdate = true
}

// 云层移动动画
function animateClouds(system: THREE.Object3D, time: number) {
  system.children.forEach((cloud, index) => {
    cloud.position.x -= 0.005
    if (cloud.position.x < -15) cloud.position.x = 15
    cloud.position.y += Math.sin(time * 0.5 + index) * 0.002
  })
}

// 阳光波动动画
function animateSun(system: THREE.Object3D, time: number) {
  const sun = system.children[0]
  if (sun) {
    const scale = 4 + Math.sin(time * 2) * 0.1
    sun.scale.set(scale, scale, 1)
  }
}

// --- 天气系统创建与销毁 ---

// 更新当前天气效果
function updateWeather(type: string) {
  // 清理现有对象
  if (weatherSystem) {
    disposeHierarchy(weatherSystem)
    scene.remove(weatherSystem)
    weatherSystem = null
  }
  if (skyMesh) {
    scene.remove(skyMesh)
    if (skyMesh.geometry) skyMesh.geometry.dispose()
    if (skyMesh.material) {
      if (Array.isArray(skyMesh.material)) {
        skyMesh.material.forEach((m) => m.dispose())
      } else {
        skyMesh.material.dispose()
      }
    }
    skyMesh = null
  }
  scene.fog = null

  // 根据类型创建新效果
  switch (type) {
    case 'sunny':
      createSunnyWeather()
      break
    case 'rainy':
      createRainyWeather()
      break
    case 'cloudy':
      createCloudyWeather()
      break
    case 'snowy':
      createSnowyWeather()
      break
  }
}

// 创建晴天
function createSunnyWeather() {
  const group = new THREE.Group()
  const material = new THREE.SpriteMaterial({
    map: sunTexture,
    color: 0xffdd00,
    transparent: true,
    blending: THREE.AdditiveBlending,
  })
  const sun = new THREE.Sprite(material)
  sun.scale.set(4, 4, 1)
  sun.position.set(2, 3, -5)
  group.add(sun)

  weatherSystem = group
  scene.add(weatherSystem)
  createSkyGradient(0x00bfff, 0x87ceeb)
}

// 创建雨天
function createRainyWeather() {
  const count = 1500
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20
    positions[i + 1] = (Math.random() - 0.5) * 20
    positions[i + 2] = (Math.random() - 0.5) * 10
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.2,
    map: rainTexture,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  weatherSystem = new THREE.Points(geometry, material)
  scene.add(weatherSystem)
  createSkyGradient(0x1a1a2e, 0x16213e)
  scene.fog = new THREE.FogExp2(0x16213e, 0.05)
}

// 创建雪天
function createSnowyWeather() {
  const count = 1500
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20
    positions[i + 1] = (Math.random() - 0.5) * 20
    positions[i + 2] = (Math.random() - 0.5) * 10
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    map: snowTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  })

  weatherSystem = new THREE.Points(geometry, material)
  scene.add(weatherSystem)
  createSkyGradient(0x2c3e50, 0xbdc3c7)
  scene.fog = new THREE.FogExp2(0xbdc3c7, 0.02)
}

// 创建阴天
function createCloudyWeather() {
  const group = new THREE.Group()

  for (let i = 0; i < 8; i++) {
    const geo = new THREE.PlaneGeometry(6, 3)
    const mat = new THREE.MeshBasicMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    })
    const cloud = new THREE.Mesh(geo, mat)

    cloud.position.set((Math.random() - 0.5) * 15, Math.random() * 3, (Math.random() - 0.5) * 8 - 2)
    const scale = Math.random() * 0.5 + 0.8
    cloud.scale.set(scale, scale, 1)

    group.add(cloud)
  }

  weatherSystem = group
  scene.add(weatherSystem)
  createSkyGradient(0x757f9a, 0xd7dde8)
}

// --- 辅助工具函数 ---

// 创建天空背景色渐变器
function createSkyGradient(colorTop: number, colorBottom: number) {
  const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
  const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float v = vUv.y;
        vec3 col = mix(bottomColor, topColor, v);
        // 添加细微的暗角和大气深度感
        float vignette = 1.0 - smoothstep(0.5, 1.5, length(vUv - 0.5));
        gl_FragColor = vec4(col * (0.8 + 0.2 * vignette), 1.0);
      }
    `

  const uniforms = {
    topColor: { value: new THREE.Color(colorTop) },
    bottomColor: { value: new THREE.Color(colorBottom) },
    uTime: { value: 0 },
  }

  const geometry = new THREE.SphereGeometry(50, 32, 32)
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  })

  skyMesh = new THREE.Mesh(geometry, material)
  scene.add(skyMesh)
}

// 递归销毁 3D 对象以释放内存
function disposeHierarchy(obj: THREE.Object3D) {
  if (!obj) return
  obj.children.forEach((child) => disposeHierarchy(child))
  if ((obj as THREE.Mesh).geometry) {
    ;(obj as THREE.Mesh).geometry.dispose()
  }
  if ((obj as THREE.Mesh).material) {
    const material = (obj as THREE.Mesh).material
    if (Array.isArray(material)) {
      material.forEach((m: any) => {
        if (m.map) m.map.dispose()
        m.dispose()
      })
    } else {
      const m = material as any
      if (m.map) m.map.dispose()
      m.dispose()
    }
  }
}

// --- 纹理生成器 (Canvas) ---

function createCloudTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

function createDropTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')!
  context.fillStyle = 'rgba(255,255,255,0.8)'
  context.beginPath()
  context.ellipse(16, 16, 2, 8, 0, 0, Math.PI * 2)
  context.fill()
  return new THREE.CanvasTexture(canvas)
}

function createSnowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(canvas)
}

function createSunTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255, 255, 255, 1)')
  g.addColorStop(0.2, 'rgba(255, 255, 200, 1)')
  g.addColorStop(0.5, 'rgba(255, 200, 0, 0.5)')
  g.addColorStop(1, 'rgba(255, 200, 0, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

// 监听天气类型变化并更新
watch(weatherType, (newVal) => {
  updateWeather(newVal)
})

onMounted(() => {
  init()
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
  if (scene) {
    disposeHierarchy(scene)
  }
})
</script>

<template>
  <div ref="container" class="absolute inset-0 z-0 w-full h-full bg-black"></div>
</template>
