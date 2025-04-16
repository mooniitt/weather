<!-- src/components/ThreeCanvas.vue -->
<template>
  <div ref="canvasContainer" class="webgl" style="width: 100%; height: 100vh"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
// 导入 GLTFLoader 推荐写法
// @ts-ignore
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const canvasContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  // 1. 创建场景
  const scene = new THREE.Scene()
  // 设置背景色为白色
  scene.background = new THREE.Color(0xffffff)

  // 2. 创建相机
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  // 3. 创建渲染器
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 启用阴影
  renderer.shadowMap.enabled = true
  // @ts-ignore
  canvasContainer.value.appendChild(renderer.domElement)

  // 4. 添加光照
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)
  // 平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 10, 7.5)
  directionalLight.castShadow = true
  // 可选：调整阴影分辨率和范围
  directionalLight.shadow.mapSize.width = 1024
  directionalLight.shadow.mapSize.height = 1024
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 50
  scene.add(directionalLight)

  // 5. 添加地面用于接收阴影
  const groundGeometry = new THREE.PlaneGeometry(20, 20)
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -2 // 地面下移到 y = -2
  ground.receiveShadow = true
  scene.add(ground)

  // 6. 加载assets下的cube.glb模型
  const loader = new GLTFLoader()
  let cube: THREE.Object3D
  loader.load(new URL('@/assets/cube.glb', import.meta.url).href, (gltf: GLTF) => {
    cube = gltf.scene
    // 缩小一倍
    cube.scale.set(0.5, 0.5, 0.5)
    // 设置 cube 的 y 位置为 0，确保与地面有2的距离
    cube.position.y = 0
    // 更通用地设置所有支持 color 的材质为白色，并移除贴图
    cube.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        // 允许模型投射和接收阴影
        mesh.castShadow = true
        mesh.receiveShadow = true
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((mat) => {
          // 类型守卫，判断 mat 是否有 color 属性
          if (
            'color' in mat &&
            mat.color instanceof THREE.Color &&
            typeof mat.color.set === 'function'
          ) {
            mat.color.set(0xffffff)
          }
          // 移除贴图
          if ('map' in mat && mat.map) {
            mat.map = null
          }
        })
      }
    })
    scene.add(cube)
  })

  // 7. 渲染循环
  function animate() {
    requestAnimationFrame(animate)

    // 如果模型已加载，旋转它
    cube.rotation.x += 0.01
    cube.rotation.y += 0.02

    renderer.render(scene, camera)
  }
  animate()

  // 可选：窗口自适应
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
})
</script>
