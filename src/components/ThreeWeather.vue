<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, toRefs } from 'vue'
import * as THREE from 'three'
import type { WeatherType } from '../stores/weather'

interface WeatherProps {
  weatherType: WeatherType
}

const props = defineProps<WeatherProps>()
const { weatherType } = toRefs(props)
const container = ref<HTMLDivElement | null>(null)

// --- Constants & Config ---
const CONFIG = {
  PARTICLE_COUNT: 4000,
  RAIN_SPEED: 0.6,
  SNOW_SPEED: 0.05,
  CLOUD_COUNT: 12,
  TRANSITION_SPEED: 0.02,
}

// --- Weather State Definitions ---
const WEATHER_STYLES: Record<WeatherType, {
  topColor: THREE.Color,
  bottomColor: THREE.Color,
  fogColor: THREE.Color,
  fogDensity: number,
  lightIntensity: number,
  cloudOpacity: number,
  particleType: 'none' | 'rain' | 'snow' | 'mist',
  isStormy: boolean
}> = {
  sunny: {
    topColor: new THREE.Color(0x0077ff),
    bottomColor: new THREE.Color(0x88ccff),
    fogColor: new THREE.Color(0x88ccff),
    fogDensity: 0.002,
    lightIntensity: 1.2,
    cloudOpacity: 0.2,
    particleType: 'none',
    isStormy: false
  },
  cloudy: {
    topColor: new THREE.Color(0x445566),
    bottomColor: new THREE.Color(0x8899aa),
    fogColor: new THREE.Color(0x8899aa),
    fogDensity: 0.015,
    lightIntensity: 0.8,
    cloudOpacity: 0.6,
    particleType: 'none',
    isStormy: false
  },
  overcast: {
    topColor: new THREE.Color(0x222233),
    bottomColor: new THREE.Color(0x444455),
    fogColor: new THREE.Color(0x444455),
    fogDensity: 0.025,
    lightIntensity: 0.4,
    cloudOpacity: 0.9,
    particleType: 'none',
    isStormy: false
  },
  rainy: {
    topColor: new THREE.Color(0x1a1a2e),
    bottomColor: new THREE.Color(0x16213e),
    fogColor: new THREE.Color(0x16213e),
    fogDensity: 0.04,
    lightIntensity: 0.3,
    cloudOpacity: 0.8,
    particleType: 'rain',
    isStormy: false
  },
  thunderstorm: {
    topColor: new THREE.Color(0x08081a),
    bottomColor: new THREE.Color(0x101020),
    fogColor: new THREE.Color(0x101020),
    fogDensity: 0.05,
    lightIntensity: 0.2,
    cloudOpacity: 1.0,
    particleType: 'rain',
    isStormy: true
  },
  snowy: {
    topColor: new THREE.Color(0x2c3e50),
    bottomColor: new THREE.Color(0xbdc3c7),
    fogColor: new THREE.Color(0xbdc3c7),
    fogDensity: 0.03,
    lightIntensity: 0.7,
    cloudOpacity: 0.7,
    particleType: 'snow',
    isStormy: false
  },
  foggy: {
    topColor: new THREE.Color(0x555555),
    bottomColor: new THREE.Color(0xaaaaaa),
    fogColor: new THREE.Color(0xaaaaaa),
    fogDensity: 0.08,
    lightIntensity: 0.5,
    cloudOpacity: 0.4,
    particleType: 'mist',
    isStormy: false
  },
  mist: {
    topColor: new THREE.Color(0x778899),
    bottomColor: new THREE.Color(0xb0c4de),
    fogColor: new THREE.Color(0xb0c4de),
    fogDensity: 0.04,
    lightIntensity: 0.7,
    cloudOpacity: 0.3,
    particleType: 'mist',
    isStormy: false
  },
  haze: {
    topColor: new THREE.Color(0x4b3a2a),
    bottomColor: new THREE.Color(0x8e7c6b),
    fogColor: new THREE.Color(0x8e7c6b),
    fogDensity: 0.06,
    lightIntensity: 0.6,
    cloudOpacity: 0.5,
    particleType: 'mist',
    isStormy: false
  }
}

// --- Engine State ---
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number
let skyMaterial: THREE.ShaderMaterial
let particleSystem: THREE.Points
let clouds: THREE.Group
let mainLight: THREE.DirectionalLight
let currentTargetStyle = { ...WEATHER_STYLES.sunny }
let lightningTime = 0

// --- Resources ---
const textures = {
  smoke: createSmokeTexture(),
  rain: createRainTexture(),
  snow: createSnowTexture()
}

function init() {
  if (!container.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  camera.position.z = 8

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  // 1. Sky Background
  createSky()

  // 2. Cloud System
  createClouds()

  // 3. Particle System
  createParticles()

  // 4. Lighting
  mainLight = new THREE.DirectionalLight(0xffffff, 1)
  mainLight.position.set(5, 10, 7)
  scene.add(mainLight)
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))

  window.addEventListener('resize', onWindowResize)
  updateTargetState(weatherType.value)
  animate()
}

function createSky() {
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
    
    // Simple noise for atmosphere
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    
    void main() {
      float noise = hash(vUv + uTime * 0.01) * 0.02;
      vec3 col = mix(bottomColor, topColor, vUv.y + noise);
      float vignette = 1.0 - smoothstep(0.5, 1.8, length(vUv - 0.5));
      gl_FragColor = vec4(col * (0.9 + 0.1 * vignette), 1.0);
    }
  `

  const geometry = new THREE.SphereGeometry(100, 32, 32)
  skyMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0x88ccff) },
      uTime: { value: 0 }
    },
    side: THREE.BackSide,
    depthWrite: false
  })

  const sky = new THREE.Mesh(geometry, skyMaterial)
  scene.add(sky)
}

function createClouds() {
  clouds = new THREE.Group()
  const geometry = new THREE.PlaneGeometry(16, 8)
  
  for (let i = 0; i < CONFIG.CLOUD_COUNT; i++) {
    const material = new THREE.MeshBasicMaterial({
      map: textures.smoke,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    const cloud = new THREE.Mesh(geometry, material)
    cloud.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 10 + 2,
      (Math.random() - 0.5) * 15 - 5
    )
    cloud.scale.setScalar(Math.random() * 2 + 1)
    cloud.userData.speed = Math.random() * 0.005 + 0.002
    clouds.add(cloud)
  }
  scene.add(clouds)
}

function createParticles() {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(CONFIG.PARTICLE_COUNT * 3)
  const velocities = new Float32Array(CONFIG.PARTICLE_COUNT)

  for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    velocities[i] = Math.random() * 0.5 + 0.5
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1))

  const material = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    opacity: 0,
    map: textures.rain,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  const time = Date.now() * 0.001

  // 1. Transition State
  lerpState()

  // 2. Animate Sky
  if (skyMaterial) skyMaterial.uniforms.uTime.value = time

  // 3. Animate Clouds
  if (clouds) {
    clouds.children.forEach((cloud: any) => {
      cloud.position.x -= cloud.userData.speed
      if (cloud.position.x < -25) cloud.position.x = 25
      cloud.material.opacity = THREE.MathUtils.lerp(cloud.material.opacity, currentTargetStyle.cloudOpacity * 0.5, 0.01)
    })
  }

  // 4. Animate Particles
  if (particleSystem) animateParticles(time)

  // 5. Lightning Logic
  if (mainLight) handleLightning(time)

  renderer.render(scene, camera)
}

function animateParticles(time: number) {
  const posArr = particleSystem.geometry.attributes.position.array as Float32Array
  const velArr = particleSystem.geometry.attributes.velocity.array as Float32Array
  const type = currentTargetStyle.particleType
  
  // Update visibility
  const targetOpacity = type === 'none' ? 0 : 0.6
  const mat = particleSystem.material as THREE.PointsMaterial
  mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.05)
  
  if (type === 'none') return

  mat.map = type === 'rain' ? textures.rain : textures.snow
  mat.size = type === 'rain' ? 0.15 : 0.1

  for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
    const idx = i * 3
    if (type === 'rain') {
      posArr[idx + 1] -= CONFIG.RAIN_SPEED * velArr[i]
      if (posArr[idx + 1] < -15) posArr[idx + 1] = 15
    } else if (type === 'snow') {
      posArr[idx + 1] -= CONFIG.SNOW_SPEED * velArr[i]
      posArr[idx] += Math.sin(time + posArr[idx + 1]) * 0.01
      if (posArr[idx + 1] < -15) posArr[idx + 1] = 15
    } else if (type === 'mist') {
       posArr[idx + 1] -= 0.005
       posArr[idx] += Math.cos(time * 0.5 + posArr[idx + 2]) * 0.005
       if (posArr[idx + 1] < -15) posArr[idx + 1] = 15
    }
  }
  particleSystem.geometry.attributes.position.needsUpdate = true
}

function handleLightning(time: number) {
  if (!currentTargetStyle.isStormy) {
    mainLight.intensity = THREE.MathUtils.lerp(mainLight.intensity, currentTargetStyle.lightIntensity, 0.1)
    return
  }

  if (time > lightningTime) {
    // Trigger Flash
    mainLight.intensity = 5 + Math.random() * 5
    lightningTime = time + Math.random() * 4 + 2
  } else {
    mainLight.intensity = THREE.MathUtils.lerp(mainLight.intensity, currentTargetStyle.lightIntensity, 0.05)
  }
}

function lerpState() {
  const style = currentTargetStyle
  if (skyMaterial) {
    skyMaterial.uniforms.topColor.value.lerp(style.topColor, CONFIG.TRANSITION_SPEED)
    skyMaterial.uniforms.bottomColor.value.lerp(style.bottomColor, CONFIG.TRANSITION_SPEED)
  }
  
  if (scene.fog instanceof THREE.FogExp2) {
    scene.fog.color.lerp(style.fogColor, CONFIG.TRANSITION_SPEED)
    scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, style.fogDensity, CONFIG.TRANSITION_SPEED)
  } else {
    scene.fog = new THREE.FogExp2(style.fogColor.getHex(), style.fogDensity)
  }
}

function updateTargetState(type: WeatherType) {
  currentTargetStyle = WEATHER_STYLES[type] || WEATHER_STYLES.sunny
}

function onWindowResize() {
  if (!container.value || !camera || !renderer) return
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

// --- Textures Generators ---
function createSmokeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
  gradient.addColorStop(0.3, 'rgba(200, 200, 200, 0.3)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

function createRainTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const g = ctx.createLinearGradient(8, 0, 8, 64)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.8)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 16, 64)
  return new THREE.CanvasTexture(canvas)
}

function createSnowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0, 'rgba(255, 255, 255, 1)')
  g.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(canvas)
}

watch(weatherType, (newVal) => updateTargetState(newVal))

onMounted(() => init())
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
})
</script>

<template>
  <div ref="container" class="absolute inset-0 z-0 w-full h-full bg-[#050505]"></div>
</template>

<style scoped>
div {
  touch-action: none;
}
</style>
