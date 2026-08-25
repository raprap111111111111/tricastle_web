<template>
  <div class="absolute inset-0 overflow-hidden select-none pointer-events-auto">
    <!-- WebGL Canvas Injection Target -->
    <div ref="containerRef" class="w-full h-full relative cursor-grab active:cursor-grabbing" />

    <!-- 3D FLOATING NAME BADGE (Anchored on top of hovered characters) -->
    <transition name="pop-label">
      <div
        v-if="hoveredEmployee && tooltipScreenPos.visible"
        class="absolute -translate-x-1/2 -translate-y-full mb-3 pointer-events-none z-30"
        :style="{
          left: `${tooltipScreenPos.x}px`,
          top: `${tooltipScreenPos.y}px`
        }"
      >
        <div
          class="px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-apricot-500/40
                 shadow-[0_12px_30px_rgba(30,58,95,0.18)] flex flex-col items-center text-center transform scale-100"
        >
          <span class="text-[9px] uppercase tracking-widest font-black text-apricot-600 bg-apricot-50 px-2 py-0.5 rounded-full border border-apricot-200/60 mb-0.5">
            {{ hoveredEmployee.badge }}
          </span>
          <h4 class="text-sm font-serif font-bold text-blueberry-800 tracking-tight leading-tight">
            {{ hoveredEmployee.name }}
          </h4>
          <p class="text-[11px] font-semibold text-blueberry-600">
            {{ hoveredEmployee.role }}
          </p>
        </div>
      </div>
    </transition>

    <!-- 3D WORLD CINEMATIC CONTROLS HUD -->
    <div class="absolute bottom-6 left-0 right-0 max-w-4xl mx-auto px-4 flex flex-col items-center gap-3 z-30 pointer-events-none">
      
      <!-- State A: House Mode (Click to Enter) -->
      <div v-if="sceneState === 'HOUSE'" class="pointer-events-auto">
        <button
          type="button"
          class="px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-apricot-400
                 text-blueberry-800 font-bold text-xs shadow-lg hover:bg-apricot-500 hover:text-white
                 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
          @click="enterHouse"
        >
          <span class="w-2 h-2 rounded-full bg-apricot-500 animate-ping" />
          <span>Step Inside Tricastle Headquarters</span>
          <i class="pi pi-arrow-right text-xs" />
        </button>
      </div>

      <!-- State B: Interior Mode (Character Navigator) -->
      <div v-else-if="sceneState === 'INTERIOR'" class="w-full max-w-lg flex flex-col items-center gap-3 pointer-events-auto">
        
        <!-- Bio Card for Current Focused Person -->
        <div class="w-full p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-appleCore-200 shadow-xl flex items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[9px] uppercase tracking-widest font-black text-apricot-600 bg-apricot-100 px-2 py-0.5 rounded-md">
                {{ currentEmployee.badge }}
              </span>
              <span class="text-[10px] font-semibold text-blueberry-500 uppercase tracking-wider truncate">
                {{ currentEmployee.role }}
              </span>
            </div>
            <h3 class="text-base font-serif font-bold text-blueberry-900 leading-tight truncate">
              {{ currentEmployee.name }}
            </h3>
            <p class="text-xs text-blueberry-600 mt-1 line-clamp-2">
              "{{ currentEmployee.description }}"
            </p>
          </div>

          <!-- Chevron Navigation -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              class="w-8 h-8 rounded-lg bg-appleCore-100 hover:bg-apricot-500 hover:text-white text-blueberry-800 transition-all flex items-center justify-center shadow-sm cursor-pointer"
              @click="prev"
            >
              <i class="pi pi-chevron-left text-xs" />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-lg bg-appleCore-100 hover:bg-apricot-500 hover:text-white text-blueberry-800 transition-all flex items-center justify-center shadow-sm cursor-pointer"
              @click="next"
            >
              <i class="pi pi-chevron-right text-xs" />
            </button>
          </div>
        </div>

        <!-- Utility Bar (Exit Scene & Manual Selectors) -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl bg-blueberry-800 hover:bg-blueberry-950 text-white text-[11px] font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            @click="exitToHouse"
          >
            <i class="pi pi-home text-xs text-apricot-400" />
            <span>Exit to House</span>
          </button>

          <div class="flex items-center gap-1 bg-white/85 backdrop-blur-md px-1.5 py-1 rounded-xl border border-appleCore-200">
            <button
              v-for="(emp, i) in employees"
              :key="emp.id"
              type="button"
              :class="[
                'w-5.5 h-5.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer',
                focusedEmployeeIndex === i
                  ? 'bg-apricot-500 text-white shadow-sm'
                  : 'text-blueberry-750 hover:bg-appleCore-100',
              ]"
              @click="jumpToEmployee(i)"
            >
              {{ i + 1 }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

// TYPES
export interface Employee {
  id: string
  name: string
  role: string
  badge: string
  description: string
  position: [number, number, number]
  activity: 'laptop' | 'coffee' | 'phone'
  skinColor: number
  hairColor: number
  shirtColor: number
}

export interface CharacterMeshBundle {
  employee: Employee
  root: THREE.Group
  hitBox: THREE.Mesh
  parts: {
    head: THREE.Mesh
    leftArm: THREE.Group
    rightArm: THREE.Group
  }
}

export interface HouseStructure {
  group: THREE.Group
  doorTrigger: THREE.Mesh
  clouds: THREE.Mesh[]
  windowMaterials: THREE.MeshStandardMaterial[]
}

// EMPLOYEES DATA
const employees: Employee[] = [
  {
    id: 'leah-tinsay',
    name: 'Leah Tinsay',
    role: 'President / Managing Director',
    badge: 'President',
    description: 'Visionary leadership guiding Tricastle International since inception.',
    position: [-2.2, 0, -1.0],
    activity: 'coffee',
    skinColor: 0xf5d0a9,
    hairColor: 0x3a2312,
    shirtColor: 0xd97736,
  },
  {
    id: 'toshiki-koyama',
    name: 'Toshiki Koyama',
    role: 'Japanese Partner',
    badge: 'Japanese Partner',
    description: 'Bridging Japanese precision with Filipino talent for world-class standards.',
    position: [-0.7, 0, -2.0],
    activity: 'phone',
    skinColor: 0xf3ccb0,
    hairColor: 0x1f1f1f,
    shirtColor: 0x1e3a5f,
  },
  {
    id: 'johnny-reosura',
    name: 'Johnny Reosura',
    role: 'Operations Manager',
    badge: 'Operations',
    description: 'Directing site logistics, training excellence, and field operations.',
    position: [0.8, 0, -2.0],
    activity: 'laptop',
    skinColor: 0xe0ac69,
    hairColor: 0x2b1d0c,
    shirtColor: 0x2e5934,
  },
  {
    id: 'ralph-barioga',
    name: 'Ralph Barioga',
    role: 'Lead Developer & Engineer',
    badge: 'Lead Developer',
    description: 'Architecting digital systems and interactive corporate experiences.',
    position: [2.3, 0, -1.0],
    activity: 'laptop',
    skinColor: 0xdfa175,
    hairColor: 0x111111,
    shirtColor: 0xf7882f,
  },
]

// PALETTE
const PALETTE = {
  appleCoreBg: 0xf4f6f8,
  wall: 0x8a9199,
  wood: 0x8b4518,
  glass: 0xa8c8e8,
  desk: 0x333333,
}

// STATE REFS
const containerRef = ref<HTMLDivElement | null>(null)
const sceneState = ref<'HOUSE' | 'INTERIOR'>('HOUSE')
const focusedEmployeeIndex = ref<number>(0)
const hoveredEmployee = ref<Employee | null>(null)
const isTransitioning = ref<boolean>(false)
const tooltipScreenPos = ref<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false })

const HOUSE_CAMERA_POS = new THREE.Vector3(0, 6, 18)
const HOUSE_CAMERA_TARGET = new THREE.Vector3(0, 1.8, 0)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let house: HouseStructure
let interiorEnv: THREE.Group
const characterBundles: CharacterMeshBundle[] = []

const controlsTarget = new THREE.Vector3(0, 1.8, 0)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(-999, -999)

let animationFrameId: number
let clock: THREE.Clock

const currentEmployee = computed(() => employees[focusedEmployeeIndex.value] || employees[0])

onMounted(() => {
  if (!containerRef.value) return
  initThree()
  clock = new THREE.Clock()
  animate()

  window.addEventListener('resize', handleResize)
  containerRef.value.addEventListener('mousemove', onMouseMove)
  containerRef.value.addEventListener('click', onClick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
  if (renderer) renderer.dispose()
})

function initThree() {
  const width = containerRef.value!.clientWidth
  const height = containerRef.value!.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(PALETTE.appleCoreBg)
  scene.fog = new THREE.FogExp2(PALETTE.appleCoreBg, 0.02)

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.copy(HOUSE_CAMERA_POS)
  camera.lookAt(HOUSE_CAMERA_TARGET)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  containerRef.value!.appendChild(renderer.domElement)

  // Lights Setup
  const ambientLight = new THREE.AmbientLight(0xfff6ec, 1.25)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.8)
  sunLight.position.set(12, 18, 14)
  sunLight.castShadow = true
  scene.add(sunLight)

  const fillLight = new THREE.DirectionalLight(0xaed2e6, 0.5)
  fillLight.position.set(-12, 8, -10)
  scene.add(fillLight)

  // Build Scene Assets
  house = buildTricastleHouse()
  scene.add(house.group)

  interiorEnv = buildInteriorEnvironment()
  scene.add(interiorEnv)

  employees.forEach((emp: Employee) => {
    const bundle = buildCharacter(emp)
    characterBundles.push(bundle)
    scene.add(bundle.root)
  })
}

// PROCEDURAL SCENE BUILDERS
function buildTricastleHouse(): HouseStructure {
  const group = new THREE.Group()
  const windowMaterials: THREE.MeshStandardMaterial[] = []
  const clouds: THREE.Mesh[] = []

  // Main Wall
  const wallMat = new THREE.MeshStandardMaterial({ color: PALETTE.wall, roughness: 0.8 })
  const mainWall = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 6), wallMat)
  mainWall.position.set(0, 2.5, -2)
  mainWall.castShadow = true
  mainWall.receiveShadow = true
  group.add(mainWall)

  // Roof / Fascia
  const roof = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.6, 6.4), wallMat)
  roof.position.set(0, 5.3, -2)
  group.add(roof)

  // Glass Front
  const winMat = new THREE.MeshStandardMaterial({ color: PALETTE.glass, roughness: 0.1, transparent: true, opacity: 0.7, emissive: 0x334466, emissiveIntensity: 0.35 })
  windowMaterials.push(winMat)
  const glassFront = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.5), winMat)
  glassFront.position.set(0, 2.2, 1.01)
  group.add(glassFront)

  // Interactive Door Trigger
  const doorTrigger = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 3.5, 0.5),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  doorTrigger.position.set(0, 1.75, 1.1)
  group.add(doorTrigger)

  // Ambient Clouds
  for (let i = 0; i < 4; i++) {
    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(1.2 + Math.random() * 0.8, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 })
    )
    cloud.position.set(-12 + i * 8, 9 + Math.random() * 2, -10)
    clouds.push(cloud)
    group.add(cloud)
  }

  return { group, doorTrigger, clouds, windowMaterials }
}

function buildInteriorEnvironment(): THREE.Group {
  const group = new THREE.Group()
  const deskMat = new THREE.MeshStandardMaterial({ color: PALETTE.desk, roughness: 0.5 })

  // Desks for employees
  employees.forEach((emp: Employee) => {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.7), deskMat)
    desk.position.set(emp.position[0], 0.35, emp.position[2] + 0.3)
    desk.castShadow = true
    group.add(desk)

    const laptop = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.02, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 })
    )
    laptop.position.set(emp.position[0], 0.72, emp.position[2] + 0.3)
    group.add(laptop)
  })

  return group
}

function buildCharacter(emp: Employee): CharacterMeshBundle {
  const root = new THREE.Group()
  root.position.set(...emp.position)

  const skinMat = new THREE.MeshStandardMaterial({ color: emp.skinColor, roughness: 0.7 })
  const hairMat = new THREE.MeshStandardMaterial({ color: emp.hairColor, roughness: 0.8 })
  const shirtMat = new THREE.MeshStandardMaterial({ color: emp.shirtColor, roughness: 0.6 })

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.25), shirtMat)
  torso.position.y = 0.65
  torso.castShadow = true
  root.add(torso)

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), skinMat)
  head.position.y = 1.15
  head.castShadow = true
  root.add(head)

  // Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 16), hairMat)
  hair.position.set(0, 1.18, -0.02)
  hair.scale.set(1.02, 0.9, 1.02)
  root.add(hair)

  // Left Arm
  const leftArm = new THREE.Group()
  leftArm.position.set(-0.28, 0.85, 0)
  const lMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), shirtMat)
  lMesh.position.y = -0.2
  leftArm.add(lMesh)
  root.add(leftArm)

  // Right Arm
  const rightArm = new THREE.Group()
  rightArm.position.set(0.28, 0.85, 0)
  const rMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), shirtMat)
  rMesh.position.y = -0.2
  rightArm.add(rMesh)
  root.add(rightArm)

  // Hitbox for raycasting hover/click
  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.5, 0.7),
    new THREE.MeshBasicMaterial({ visible: false })
  )
  hitBox.position.y = 0.75
  hitBox.userData = { type: 'employee', employeeData: emp, employeeId: emp.id }
  root.add(hitBox)

  return {
    employee: emp,
    root,
    hitBox,
    parts: { head, leftArm, rightArm },
  }
}

function handleResize() {
  if (!containerRef.value || !renderer) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function onMouseMove(event: MouseEvent) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const hitObjects: THREE.Object3D[] = characterBundles.map((c: CharacterMeshBundle) => c.hitBox)
  if (sceneState.value === 'HOUSE') {
    hitObjects.push(house.doorTrigger)
  }

  const intersects = raycaster.intersectObjects(hitObjects)
  if (intersects.length > 0) {
    const hitData = intersects[0].object.userData
    if (hitData.type === 'employee') {
      const emp = hitData.employeeData as Employee
      hoveredEmployee.value = emp

      const bundle = characterBundles.find((c: CharacterMeshBundle) => c.employee.id === emp.id)
      if (bundle) {
        gsap.to(bundle.root.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.2 })
      }
    }
  } else {
    if (hoveredEmployee.value) {
      characterBundles.forEach((b: CharacterMeshBundle) => {
        gsap.to(b.root.scale, { x: 1, y: 1, z: 1, duration: 0.2 })
      })
    }
    hoveredEmployee.value = null
  }
}

function onClick() {
  raycaster.setFromCamera(mouse, camera)

  if (sceneState.value === 'HOUSE') {
    const intersects = raycaster.intersectObject(house.doorTrigger)
    if (intersects.length > 0) {
      enterHouse()
    }
  } else if (sceneState.value === 'INTERIOR') {
    const hitObjects = characterBundles.map((c: CharacterMeshBundle) => c.hitBox)
    const intersects = raycaster.intersectObjects(hitObjects)
    if (intersects.length > 0) {
      const empId = intersects[0].object.userData.employeeId
      const index = employees.findIndex((e: Employee) => e.id === empId)
      if (index !== -1) {
        jumpToEmployee(index)
      }
    }
  }
}

function enterHouse() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  sceneState.value = 'INTERIOR'

  const emp = currentEmployee.value
  const targetCamPos = new THREE.Vector3(emp.position[0], 1.6, emp.position[2] + 2.2)
  const targetLook = new THREE.Vector3(emp.position[0], 1.1, emp.position[2])

  gsap.to(camera.position, {
    x: targetCamPos.x,
    y: targetCamPos.y,
    z: targetCamPos.z,
    duration: 1.8,
    ease: 'power3.inOut',
    onUpdate: () => camera.lookAt(controlsTarget),
    onComplete: () => {
      isTransitioning.value = false
    },
  })

  gsap.to(controlsTarget, {
    x: targetLook.x,
    y: targetLook.y,
    z: targetLook.z,
    duration: 1.8,
    ease: 'power3.inOut',
  })
}

function exitToHouse() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  sceneState.value = 'HOUSE'

  gsap.to(camera.position, {
    x: HOUSE_CAMERA_POS.x,
    y: HOUSE_CAMERA_POS.y,
    z: HOUSE_CAMERA_POS.z,
    duration: 1.6,
    ease: 'power3.inOut',
    onUpdate: () => camera.lookAt(controlsTarget),
    onComplete: () => {
      isTransitioning.value = false
    },
  })

  gsap.to(controlsTarget, {
    x: HOUSE_CAMERA_TARGET.x,
    y: HOUSE_CAMERA_TARGET.y,
    z: HOUSE_CAMERA_TARGET.z,
    duration: 1.6,
    ease: 'power3.inOut',
  })
}

function focusEmployee(idx: number) {
  if (isTransitioning.value) return
  focusedEmployeeIndex.value = idx
  const emp = employees[idx]
  if (!emp) return

  isTransitioning.value = true
  const targetCamPos = new THREE.Vector3(emp.position[0], 1.6, emp.position[2] + 2.2)
  const targetLook = new THREE.Vector3(emp.position[0], 1.1, emp.position[2])

  gsap.to(camera.position, {
    x: targetCamPos.x,
    y: targetCamPos.y,
    z: targetCamPos.z,
    duration: 1.2,
    ease: 'power2.inOut',
    onUpdate: () => camera.lookAt(controlsTarget),
    onComplete: () => {
      isTransitioning.value = false
    },
  })

  gsap.to(controlsTarget, {
    x: targetLook.x,
    y: targetLook.y,
    z: targetLook.z,
    duration: 1.2,
    ease: 'power2.inOut',
  })
}

function next() {
  const nextIdx = (focusedEmployeeIndex.value + 1) % employees.length
  focusEmployee(nextIdx)
}

function prev() {
  const prevIdx = (focusedEmployeeIndex.value - 1 + employees.length) % employees.length
  focusEmployee(prevIdx)
}

function jumpToEmployee(idx: number) {
  focusEmployee(idx)
}

function updateTooltipPosition() {
  if (!hoveredEmployee.value || !containerRef.value) {
    tooltipScreenPos.value.visible = false
    return
  }

  const bundle = characterBundles.find((b: CharacterMeshBundle) => b.employee.id === hoveredEmployee.value?.id)
  if (!bundle) return

  const headPos = new THREE.Vector3()
  bundle.parts.head.getWorldPosition(headPos)
  headPos.y += 0.35

  const proj = headPos.clone().project(camera)
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  const x = (proj.x * 0.5 + 0.5) * width
  const y = (-proj.y * 0.5 + 0.5) * height

  tooltipScreenPos.value = {
    x,
    y,
    visible: proj.z < 1,
  }
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  const elapsedTime = clock.getElapsedTime()

  if (house) {
    house.clouds.forEach((c: THREE.Mesh, idx: number) => {
      c.position.x += Math.sin(elapsedTime * 0.15 + idx) * 0.002
    })
    house.windowMaterials.forEach((m: THREE.MeshStandardMaterial) => {
      m.emissiveIntensity = 0.35 + Math.sin(elapsedTime * 2.0) * 0.1
    })
  }

  characterBundles.forEach((b: CharacterMeshBundle) => {
    const act = b.employee.activity
    const parts = b.parts

    if (act === 'laptop') {
      parts.leftArm.rotation.x = 0.9 + Math.sin(elapsedTime * 6) * 0.05
      parts.rightArm.rotation.x = 0.9 + Math.cos(elapsedTime * 6) * 0.05
      parts.head.rotation.x = 0.15 + Math.sin(elapsedTime * 1.2) * 0.02
    } else if (act === 'coffee') {
      const cycle = Math.sin(elapsedTime * 1.4)
      if (cycle > 0.5) {
        parts.rightArm.rotation.x = 1.3
        parts.head.rotation.x = -0.1
      } else {
        parts.rightArm.rotation.x = 0.8
        parts.head.rotation.x = 0.05
      }
    } else if (act === 'phone') {
      parts.head.rotation.y = Math.sin(elapsedTime * 1.5) * 0.1
    }
  })

  if (!isTransitioning.value && sceneState.value === 'HOUSE') {
    camera.position.x = HOUSE_CAMERA_POS.x + Math.sin(elapsedTime * 0.35) * 0.2
    camera.lookAt(controlsTarget)
  } else {
    camera.lookAt(controlsTarget)
  }

  updateTooltipPosition()
  renderer.render(scene, camera)
}
</script>

<style scoped>
.pop-label-enter-active,
.pop-label-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-label-enter-from,
.pop-label-leave-to {
  opacity: 0;
  transform: translate(-50%, -85%) scale(0.85);
}
</style>