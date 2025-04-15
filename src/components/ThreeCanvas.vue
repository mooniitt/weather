<!-- src/components/ThreeCanvas.vue -->
<template>
  <div ref="canvasContainer" class="webgl" style="width: 100%; height: 100vh"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
// 新增导入 GLTFLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const canvasContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  // 1. 创建场景
  const scene = new THREE.Scene()

  // 2. 创建相机
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  // 3. 创建渲染器
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  canvasContainer.value.appendChild(renderer.domElement)

  // 4. 加载assets下的cube.glb模型
  const loader = new GLTFLoader()
  let cube: THREE.Object3D | null = null
  loader.load(new URL('@/assets/cube.glb', import.meta.url).href, (gltf) => {
    cube = gltf.scene
    // 更通用地设置所有支持 color 的材质为白色，并移除贴图
    cube.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((mat) => {
          // 只要有 color 属性就设置为白色
          if ((mat as any).color && typeof (mat as any).color.set === 'function') {
            ;(mat as any).color.set(0xffffff)
          }
          // 移除贴图
          if ((mat as any).map) {
            ;(mat as any).map = null
          }
        })
      }
    })
    scene.add(cube)
  })

  // 5. 渲染循环
  function animate() {
    requestAnimationFrame(animate)

    // 如果模型已加载，旋转它
    if (cube) {
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
    }

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
