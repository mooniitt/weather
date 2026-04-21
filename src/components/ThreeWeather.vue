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
  TRANSITION_SPEED: 0.015,
  SHADOW_SIZE: 1024,
  GROUND_SIZE: 50,
}

// --- Weather State Definitions (Enhanced for Advanced Lighting) ---
const WEATHER_STYLES: Record<WeatherType, {
  topColor: THREE.Color,
  bottomColor: THREE.Color,
  fogColor: THREE.Color,
  fogDensity: number,
  lightIntensity: number,
  cloudOpacity: number,
  particleType: 'none' | 'rain' | 'snow' | 'mist',
  isStormy: boolean,
  groundWetness: number,
  groundReflectivity: number,
  sunPos: THREE.Vector3
}> = {
  sunny: {
    topColor: new THREE.Color(0x00aaff),
    bottomColor: new THREE.Color(0xaaccff),
    fogColor: new THREE.Color(0xaaccff),
    fogDensity: 0.002,
    lightIntensity: 1.5,
    cloudOpacity: 0.2,
    particleType: 'none',
    isStormy: false,
    groundWetness: 0.1,
    groundReflectivity: 0.2,
    sunPos: new THREE.Vector3(10, 20, 10)
  },
  cloudy: {
    topColor: new THREE.Color(0x556677),
    bottomColor: new THREE.Color(0x99aabb),
    fogColor: new THREE.Color(0x99aabb),
    fogDensity: 0.015,
    lightIntensity: 1.0,
    cloudOpacity: 0.6,
    particleType: 'none',
    isStormy: false,
    groundWetness: 0.2,
    groundReflectivity: 0.3,
    sunPos: new THREE.Vector3(5, 10, 5)
  },
  overcast: {
    topColor: new THREE.Color(0x333344),
    bottomColor: new THREE.Color(0x555566),
    fogColor: new THREE.Color(0x555566),
    fogDensity: 0.025,
    lightIntensity: 0.6,
    cloudOpacity: 0.9,
    particleType: 'none',
    isStormy: false,
    groundWetness: 0.4,
    groundReflectivity: 0.4,
    sunPos: new THREE.Vector3(0, 10, 0)
  },
  rainy: {
    topColor: new THREE.Color(0x1a1a2e),
    bottomColor: new THREE.Color(0x16213e),
    fogColor: new THREE.Color(0x16213e),
    fogDensity: 0.04,
    lightIntensity: 0.4,
    cloudOpacity: 0.8,
    particleType: 'rain',
    isStormy: false,
    groundWetness: 1.0,
    groundReflectivity: 0.8,
    sunPos: new THREE.Vector3(-10, 15, -5)
  },
  thunderstorm: {
    topColor: new THREE.Color(0x0a0a1a),
    bottomColor: new THREE.Color(0x121225),
    fogColor: new THREE.Color(0x121225),
    fogDensity: 0.05,
    lightIntensity: 0.3,
    cloudOpacity: 1.0,
    particleType: 'rain',
    isStormy: true,
    groundWetness: 1.0,
    groundReflectivity: 0.9,
    sunPos: new THREE.Vector3(-5, 10, -5)
  },
  snowy: {
    topColor: new THREE.Color(0x34495e),
    bottomColor: new THREE.Color(0xecf0f1),
    fogColor: new THREE.Color(0xecf0f1),
    fogDensity: 0.03,
    lightIntensity: 0.9,
    cloudOpacity: 0.7,
    particleType: 'snow',
    isStormy: false,
    groundWetness: 0.5,
    groundReflectivity: 0.2,
    sunPos: new THREE.Vector3(10, 10, 10)
  },
  foggy: {
    topColor: new THREE.Color(0x666666),
    bottomColor: new THREE.Color(0xbbbbbb),
    fogColor: new THREE.Color(0xbbbbbb),
    fogDensity: 0.1,
    lightIntensity: 0.6,
    cloudOpacity: 0.4,
    particleType: 'mist',
    isStormy: false,
    groundWetness: 0.6,
    groundReflectivity: 0.3,
    sunPos: new THREE.Vector3(0, 5, 0)
  },
  mist: {
    topColor: new THREE.Color(0x8899aa),
    bottomColor: new THREE.Color(0xc0d2e8),
    fogColor: new THREE.Color(0xc0d2e8),
    fogDensity: 0.05,
    lightIntensity: 0.8,
    cloudOpacity: 0.3,
    particleType: 'mist',
    isStormy: false,
    groundWetness: 0.4,
    groundReflectivity: 0.4,
    sunPos: new THREE.Vector3(5, 5, 5)
  },
  haze: {
    topColor: new THREE.Color(0x5b4a3a),
    bottomColor: new THREE.Color(0x9e8c7b),
    fogColor: new THREE.Color(0x9e8c7b),
    fogDensity: 0.07,
    lightIntensity: 0.7,
    cloudOpacity: 0.5,
    particleType: 'mist',
    isStormy: false,
    groundWetness: 0.3,
    groundReflectivity: 0.2,
    sunPos: new THREE.Vector3(5, 5, -5)
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
let ground: THREE.Mesh
let groundMaterial: THREE.MeshPhysicalMaterial
let envMap: THREE.CubeTexture
let cubeCamera: THREE.CubeCamera
let currentTargetStyle = { ...WEATHER_STYLES.sunny }
let lightningTime = 0

// --- Resources ---
const textures = {
  smoke: createTexture('smoke'),
  rain: createTexture('rain'),
  snow: createTexture('snow'),
  groundNormal: createTexture('noise')
}

function init() {
  if (!container.value) return

  // 1. Scene Setup
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000)
  camera.position.set(0, 3, 10)
  camera.lookAt(0, 2, 0)

  // 2. Renderer Setup (Enable Shadows & High Bits)
  renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true, 
    powerPreference: 'high-performance' 
  })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap // Simulation of PCSS
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.value.appendChild(renderer.domElement)

  // 3. Environment Mapping Setup
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  })
  cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget)

  // 4. Component Creation
  createSky()
  createGround()
  createClouds()
  createParticles()

  // 5. Lighting
  mainLight = new THREE.DirectionalLight(0xffffff, 1.5)
  mainLight.position.copy(currentTargetStyle.sunPos)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.set(CONFIG.SHADOW_SIZE, CONFIG.SHADOW_SIZE)
  mainLight.shadow.camera.left = -20
  mainLight.shadow.camera.right = 20
  mainLight.shadow.camera.top = 20
  mainLight.shadow.camera.bottom = -20
  scene.add(mainLight)

  const ambient = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambient)

  window.addEventListener('resize', onWindowResize)
  updateTargetState(weatherType.value)
  animate()
}

function createSky() {
  // Advanced Atmospheric Scattering Approximation Shader
  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform vec3 sunPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    
    void main() {
      vec3 dir = normalize(vWorldPosition);
      float h = normalize(vWorldPosition).y;
      
      // Basic Scattering
      float sunAmount = max(dot(dir, normalize(sunPosition)), 0.0);
      vec3 sky = mix(bottomColor, topColor, max(h, 0.0));
      
      // Glow around sun (Mie)
      sky += pow(sunAmount, 8.0) * vec3(1.0, 0.8, 0.6) * 0.5;
      sky += pow(sunAmount, 64.0) * vec3(1.0, 0.9, 0.8) * 1.0;
      
      gl_FragColor = vec4(sky, 1.0);
    }
  `

  const geometry = new THREE.SphereGeometry(200, 32, 32)
  skyMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      topColor: { value: new THREE.Color() },
      bottomColor: { value: new THREE.Color() },
      sunPosition: { value: new THREE.Vector3() }
    },
    side: THREE.BackSide,
    depthWrite: false
  })

  scene.add(new THREE.Mesh(geometry, skyMaterial))
}

function createGround() {
  const geometry = new THREE.PlaneGeometry(CONFIG.GROUND_SIZE, CONFIG.GROUND_SIZE, 128, 128)
  groundMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    roughness: 0.8,
    metalness: 0.1,
    normalMap: textures.groundNormal,
    normalScale: new THREE.Vector2(0.5, 0.5),
    envMapIntensity: 1.0,
    transparent: true,
    opacity: 0.9
  })

  ground = new THREE.Mesh(geometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

function createClouds() {
  clouds = new THREE.Group()
  const geometry = new THREE.PlaneGeometry(24, 12)
  
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
      (Math.random() - 0.5) * 60,
      (Math.random() * 5) + 10,
      (Math.random() - 0.5) * 30 - 10
    )
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
    positions[i * 3] = (Math.random() - 0.5) * 40
    positions[i * 3 + 1] = Math.random() * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40
    velocities[i] = Math.random() * 0.5 + 0.5
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1))

  const material = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  const time = Date.now() * 0.001

  // 1. Transition Engine
  lerpState(time)

  // 2. Local Animations
  animateClouds(time)
  animateParticles(time)
  handleLightning(time)

  // 3. Dynamic Environment Update (Optimized)
  // Only update env every few frames or slowly to simulate Path Tracing GI
  if (Math.floor(time * 60) % 5 === 0) {
    ground.visible = false // Don't reflect the ground in the ground
    cubeCamera.update(renderer, scene)
    ground.visible = true
    groundMaterial.envMap = cubeCamera.renderTarget.texture
  }

  renderer.render(scene, camera)
}

function animateClouds(time: number) {
  clouds.children.forEach((cloud: any) => {
    cloud.position.x -= cloud.userData.speed
    if (cloud.position.x < -40) cloud.position.x = 40
    cloud.material.opacity = THREE.MathUtils.lerp(cloud.material.opacity, currentTargetStyle.cloudOpacity * 0.4, 0.01)
  })
}

function animateParticles(time: number) {
  const posArr = particleSystem.geometry.attributes.position.array as Float32Array
  const velArr = particleSystem.geometry.attributes.velocity.array as Float32Array
  const type = currentTargetStyle.particleType
  
  const mat = particleSystem.material as THREE.PointsMaterial
  const targetOpacity = type === 'none' ? 0 : 0.6
  mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.05)
  
  if (type === 'none') return

  mat.map = type === 'rain' ? textures.rain : (type === 'snow' ? textures.snow : null)
  mat.size = type === 'rain' ? 0.2 : 0.1

  for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
    const idx = i * 3
    if (type === 'rain') {
      posArr[idx + 1] -= CONFIG.RAIN_SPEED * velArr[i]
      if (posArr[idx + 1] < 0) {
          posArr[idx + 1] = 20
          // Simple Ripple Simulation Idea: we could trigger something here
      }
    } else if (type === 'snow') {
      posArr[idx + 1] -= CONFIG.SNOW_SPEED * velArr[i]
      posArr[idx] += Math.sin(time + posArr[idx + 1]) * 0.02
      if (posArr[idx + 1] < 0) posArr[idx + 1] = 20
    }
  }
  particleSystem.geometry.attributes.position.needsUpdate = true
}

function handleLightning(time: number) {
  if (!currentTargetStyle.isStormy) {
    mainLight.intensity = THREE.MathUtils.lerp(mainLight.intensity, currentTargetStyle.lightIntensity, 0.05)
    return
  }

  if (time > lightningTime) {
    mainLight.intensity = 10 + Math.random() * 20
    lightningTime = time + Math.random() * 5 + 2
  } else {
    mainLight.intensity = THREE.MathUtils.lerp(mainLight.intensity, currentTargetStyle.lightIntensity, 0.1)
  }
}

function lerpState(time: number) {
  const style = currentTargetStyle
  
  // Sky
  skyMaterial.uniforms.topColor.value.lerp(style.topColor, CONFIG.TRANSITION_SPEED)
  skyMaterial.uniforms.bottomColor.value.lerp(style.bottomColor, CONFIG.TRANSITION_SPEED)
  skyMaterial.uniforms.sunPosition.value.lerp(style.sunPos, CONFIG.TRANSITION_SPEED)
  
  // Lighting
  mainLight.position.lerp(style.sunPos, CONFIG.TRANSITION_SPEED)
  
  // Fog
  if (scene.fog instanceof THREE.FogExp2) {
    scene.fog.color.lerp(style.fogColor, CONFIG.TRANSITION_SPEED)
    scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, style.fogDensity, CONFIG.TRANSITION_SPEED)
  } else {
    scene.fog = new THREE.FogExp2(style.fogColor.getHex(), style.fogDensity)
  }
  
  // Ground Physical Properties (Inspired by Water/Wetness)
  groundMaterial.roughness = THREE.MathUtils.lerp(groundMaterial.roughness, 1.0 - style.groundWetness * 0.9, CONFIG.TRANSITION_SPEED)
  groundMaterial.metalness = THREE.MathUtils.lerp(groundMaterial.metalness, style.groundReflectivity * 0.5, CONFIG.TRANSITION_SPEED)
  groundMaterial.clearcoat = THREE.MathUtils.lerp(groundMaterial.clearcoat || 0, style.groundWetness, CONFIG.TRANSITION_SPEED)
  groundMaterial.clearcoatRoughness = 1.0 - style.groundWetness
  
  // Ripple Animation using NormalMap Offset
  if (style.groundWetness > 0.5) {
     groundMaterial.normalScale.setScalar(0.8 + Math.sin(time * 2.0) * 0.2)
  } else {
     groundMaterial.normalScale.setScalar(0.2)
  }
}

function updateTargetState(type: WeatherType) {
  currentTargetStyle = WEATHER_STYLES[type] || WEATHER_STYLES.sunny
}

function createTexture(type: 'smoke' | 'rain' | 'snow' | 'noise') {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  if (type === 'smoke') {
    canvas.width = canvas.height = 128
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
    g.addColorStop(0.5, 'rgba(200, 200, 200, 0.1)')
    g.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
  } else if (type === 'rain') {
    canvas.width = 16
    canvas.height = 64
    const g = ctx.createLinearGradient(8, 0, 8, 64)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.9)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 16, 64)
  } else if (type === 'snow') {
    canvas.width = canvas.height = 32
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(16, 16, 14, 0, Math.PI * 2)
    ctx.fill()
  } else if (type === 'noise') {
    canvas.width = canvas.height = 256
    for(let i=0; i<256; i++) {
      for(let j=0; j<256; j++) {
        const c = Math.random() * 255
        ctx.fillStyle = `rgb(${c},${c},${c})`
        ctx.fillRect(i, j, 1, 1)
      }
    }
  }
  
  const tex = new THREE.CanvasTexture(canvas)
  if (type === 'noise') {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  }
  return tex
}

function onWindowResize() {
  if (!container.value || !camera || !renderer) return
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

watch(weatherType, (newVal) => updateTargetState(newVal))

onMounted(() => init())
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  cancelAnimationFrame(animationId)
  renderer?.dispose()
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
