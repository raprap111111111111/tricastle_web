<template>
    <div class="relative w-full h-full overflow-hidden select-none">
        <div ref="canvasContainer" class="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

        <!-- Construction Progress Indicator
        <div class="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div ref="progressBar"
                class="opacity-0 flex items-center gap-3 bg-black/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
                <div class="relative w-48 h-1 bg-white/15 rounded-full overflow-hidden">
                    <div ref="progressFill"
                        class="absolute inset-y-0 left-0 bg-gradient-to-r from-apricot-400 to-apricot-500 rounded-full transition-all duration-300"
                        style="width: 0%" />
                </div>
                <span ref="progressText" class="text-[11px] font-semibold tracking-wider text-white/70 uppercase">
                    0%
                </span>
            </div>
        </div> -->

        <!-- Bottom-Left Narrative Overlay -->
        <div class="absolute bottom-8 left-6 md:left-12 z-10 pointer-events-none max-w-md">
            <div ref="textReveal" class="opacity-0 translate-y-6 transition-all duration-1000 ease-out space-y-3">
                <div
                    class="inline-flex items-center gap-2.5 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
                    <span class="w-2 h-2 rounded-full bg-apricot-500 animate-pulse" />
                    <span class="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">
                        Tricastle Development
                    </span>
                </div>

                <h1
                    class="text-3xl md:text-4xl font-serif font-extrabold text-white leading-[1.15] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                    Building excellence <br />
                    <span class="text-apricot-400">from the ground up.</span>
                </h1>

                <p
                    class="text-[13px] text-white/85 font-normal bg-black/45 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl leading-relaxed">
                    Precision engineering meets architectural vision. Every beam, every column —
                    constructed to the Tricastle standard.
                </p>
            </div>
        </div>

        <!-- Phase Label -->
        <div class="absolute bottom-8 right-6 z-10 pointer-events-none">
            <div ref="phaseLabel"
                class="opacity-0 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                <span ref="phaseLabelText" class="text-[11px] font-semibold tracking-wider text-white/70 uppercase">
                    Foundation
                </span>
            </div>
        </div>

        <button type="button" title="Replay Construction"
            class="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-white/80 flex items-center justify-center hover:bg-apricot-500 hover:text-white hover:border-apricot-500/50 transition-all shadow-2xl active:scale-95 cursor-pointer"
            @click="replayAnimation">
            <i class="pi pi-refresh text-sm" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

const canvasContainer = ref<HTMLDivElement | null>(null)
const textReveal = ref<HTMLDivElement | null>(null)
const progressBar = ref<HTMLDivElement | null>(null)
const progressFill = ref<HTMLDivElement | null>(null)
const progressText = ref<HTMLSpanElement | null>(null)
const phaseLabel = ref<HTMLDivElement | null>(null)
const phaseLabelText = ref<HTMLSpanElement | null>(null)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let animationFrameId = 0
let masterTimeline: gsap.core.Timeline | null = null

const buildingGroup = new THREE.Group()

// Dust particles
const dustParticles: THREE.Points[] = []

const PALETTE = {
    concreteFrame: 0x8e959e,
    concreteDark: 0x6e747d,
    concreteLight: 0xa8adb4,
    woodMahogany: 0x9e471d,
    woodDeep: 0x6d2d10,
    graniteBlack: 0x0c0e11,
    glassTint: 0x1d2936,
    plazaGray: 0xbac0c6,
    grassGreen: 0x4d8242,
    skyTop: 0x4a9de0,
    skyHorizon: 0xc4dff0,
    rebar: 0x8b4513,
    scaffolding: 0x999999,
}

const mats = {
    concreteFrame: new THREE.MeshStandardMaterial({ color: PALETTE.concreteFrame, roughness: 0.65, metalness: 0.08 }),
    concreteDark: new THREE.MeshStandardMaterial({ color: PALETTE.concreteDark, roughness: 0.7, metalness: 0.05 }),
    concreteLight: new THREE.MeshStandardMaterial({ color: PALETTE.concreteLight, roughness: 0.75, metalness: 0.03 }),
    woodSlat: new THREE.MeshStandardMaterial({ color: PALETTE.woodMahogany, roughness: 0.45, metalness: 0.03 }),
    woodBacking: new THREE.MeshStandardMaterial({ color: PALETTE.woodDeep, roughness: 0.65, metalness: 0.01 }),
    graniteColumn: new THREE.MeshStandardMaterial({ color: PALETTE.graniteBlack, roughness: 0.1, metalness: 0.9 }),
    glass: new THREE.MeshPhysicalMaterial({ color: PALETTE.glassTint, metalness: 0.2, roughness: 0.05, transmission: 0.5, opacity: 0.9, transparent: true }),
    glassFrost: new THREE.MeshPhysicalMaterial({ color: 0xb0bac4, metalness: 0.05, roughness: 0.4, transparent: true, opacity: 0.7 }),
    plaza: new THREE.MeshStandardMaterial({ color: PALETTE.plazaGray, roughness: 0.9 }),
    grass: new THREE.MeshStandardMaterial({ color: PALETTE.grassGreen, roughness: 0.95 }),
    plant: new THREE.MeshStandardMaterial({ color: 0x2e6a32, roughness: 0.85 }),
    scaffolding: new THREE.MeshStandardMaterial({ color: PALETTE.scaffolding, roughness: 0.5, metalness: 0.4, transparent: true, opacity: 0.7 }),
    rebar: new THREE.MeshStandardMaterial({ color: PALETTE.rebar, roughness: 0.6, metalness: 0.3 }),
}

const groups = {
    ground: new THREE.Group(),
    foundation: new THREE.Group(),
    scaffoldingLower: new THREE.Group(),
    coreWalls: new THREE.Group(),
    columns: new THREE.Group(),
    canopy: new THREE.Group(),
    scaffoldingUpper: new THREE.Group(),
    upperFrame: new THREE.Group(),
    woodLouvers: new THREE.Group(),
    glassStorefront: new THREE.Group(),
    details: new THREE.Group(),
    scaffoldingFinal: new THREE.Group(),
}

const BUILD_ORDER = [
    'ground', 'foundation', 'scaffoldingLower', 'coreWalls', 'columns',
    'canopy', 'scaffoldingUpper', 'upperFrame', 'woodLouvers',
    'glassStorefront', 'scaffoldingFinal', 'details',
] as const

const PHASE_NAMES: Record<string, string> = {
    ground: 'Site Preparation',
    foundation: 'Foundation Work',
    scaffoldingLower: 'Scaffolding Setup',
    coreWalls: 'Core Structure',
    columns: 'Column Installation',
    canopy: 'Canopy Construction',
    scaffoldingUpper: 'Upper Scaffolding',
    upperFrame: 'Upper Framework',
    woodLouvers: 'Facade Cladding',
    glassStorefront: 'Glazing Installation',
    scaffoldingFinal: 'Scaffolding Removal',
    details: 'Final Details',
}

onMounted(() => {
    if (!canvasContainer.value) return
    initThree()
    buildSceneGeometry()
    playConstructionAnimation()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationFrameId)
    masterTimeline?.kill()
    renderer?.dispose()
    renderer?.domElement?.remove()
})

function initThree() {
    const container = canvasContainer.value!
    const width = container.clientWidth
    const height = container.clientHeight

    scene = new THREE.Scene()
    scene.background = new THREE.Color(PALETTE.skyHorizon)
    scene.fog = new THREE.FogExp2(PALETTE.skyHorizon, 0.008)

    camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 500)

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    container.appendChild(renderer.domElement)

    buildingGroup.position.set(-6.5, 0, 0)
    scene.add(buildingGroup)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.maxPolarAngle = Math.PI / 2 - 0.03
    controls.minDistance = 14
    controls.maxDistance = 60
    controls.target.set(-6.5, 5.5, 0)
    controls.enabled = false

    // Lighting
    scene.add(new THREE.AmbientLight(0xf0f6ff, 0.55))
    scene.add(new THREE.HemisphereLight(PALETTE.skyTop, 0x7a8a6a, 0.55))

    const sun = new THREE.DirectionalLight(0xfff6ea, 2.6)
    sun.position.set(22, 30, 18)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -35
    sun.shadow.camera.right = 35
    sun.shadow.camera.top = 35
    sun.shadow.camera.bottom = -10
    sun.shadow.bias = -0.0003
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0xb2d2ec, 0.5)
    fill.position.set(-20, 12, -10)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xffe8d0, 0.4)
    rim.position.set(0, 8, -20)
    scene.add(rim)

    // Sky dome
    const skyMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
            topColor: { value: new THREE.Color(PALETTE.skyTop) },
            botColor: { value: new THREE.Color(PALETTE.skyHorizon) },
        },
        vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 botColor;
      varying vec3 vWorldPos;
      void main() {
        float t = smoothstep(-0.05, 0.7, normalize(vWorldPos).y);
        gl_FragColor = vec4(mix(botColor, topColor, t), 1.0);
      }
    `,
    })
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), skyMat))

    Object.values(groups).forEach((g) => buildingGroup.add(g))

    const clock = new THREE.Clock()
    const renderLoop = () => {
        animationFrameId = requestAnimationFrame(renderLoop)
        const dt = clock.getDelta()
        updateDust(dt)
        controls.update()
        renderer.render(scene, camera)
    }
    renderLoop()
}

function createMesh(geo: THREE.BufferGeometry, mat: THREE.Material, cast = true, rec = true) {
    const m = new THREE.Mesh(geo, mat)
    m.castShadow = cast
    m.receiveShadow = rec
    return m
}

function setPos(mesh: THREE.Object3D, x: number, y: number, z: number) {
    mesh.position.set(x, y, z)
    return mesh
}

/* ---- DUST PARTICLES ---- */
function spawnDust(x: number, y: number, z: number, count = 40) {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const velocities: number[] = []

    for (let i = 0; i < count; i++) {
        positions[i * 3] = x + (Math.random() - 0.5) * 6
        positions[i * 3 + 1] = y + Math.random() * 1.5
        positions[i * 3 + 2] = z + (Math.random() - 0.5) * 4
        velocities.push(
            (Math.random() - 0.5) * 2,
            Math.random() * 1.5 + 0.5,
            (Math.random() - 0.5) * 2
        )
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
        color: 0xc8bfb0,
        size: 0.12,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)
        ; (points as any)._velocities = velocities
        ; (points as any)._life = 2.5
        ; (points as any)._age = 0

    scene.add(points)
    dustParticles.push(points)
}

function updateDust(dt: number) {
    for (let i = dustParticles.length - 1; i >= 0; i--) {
        const p = dustParticles[i]
        const age = ((p as any)._age += dt)
        const life = (p as any)._life
        const vel = (p as any)._velocities as number[]

        if (age > life) {
            scene.remove(p)
            p.geometry.dispose()
                ; (p.material as THREE.PointsMaterial).dispose()
            dustParticles.splice(i, 1)
            continue
        }

        const posArr = p.geometry.attributes.position.array as Float32Array
        for (let j = 0; j < posArr.length / 3; j++) {
            posArr[j * 3] += vel[j * 3] * dt * 0.4
            posArr[j * 3 + 1] += vel[j * 3 + 1] * dt * 0.4
            posArr[j * 3 + 2] += vel[j * 3 + 2] * dt * 0.4
            vel[j * 3 + 1] -= dt * 0.3 // gravity
        }
        p.geometry.attributes.position.needsUpdate = true

        const mat = p.material as THREE.PointsMaterial
        mat.opacity = 0.6 * (1 - age / life)
    }
}

/* ---- SCAFFOLDING ---- */
function createScaffoldingSection(xStart: number, xEnd: number, yBottom: number, yTop: number, z: number, group: THREE.Group) {
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, yTop - yBottom, 6)
    const crossGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 6)

    const spacing = 2.5
    for (let x = xStart; x <= xEnd; x += spacing) {
        // Vertical poles
        const pole1 = createMesh(poleGeo, mats.scaffolding)
        pole1.position.set(x, yBottom + (yTop - yBottom) / 2, z)
        group.add(pole1)

        const pole2 = createMesh(poleGeo, mats.scaffolding)
        pole2.position.set(x, yBottom + (yTop - yBottom) / 2, z + 1.2)
        group.add(pole2)

        // Horizontal cross bars at intervals
        for (let y = yBottom + 2; y <= yTop; y += 2.5) {
            const cross = createMesh(crossGeo, mats.scaffolding)
            cross.rotation.z = Math.PI / 2
            cross.rotation.y = Math.PI / 2
            cross.position.set(x, y, z + 0.6)
            cross.scale.set(1, 1.2, 1)
            group.add(cross)
        }
    }

    // Horizontal rails connecting poles
    for (let y = yBottom + 2; y <= yTop; y += 2.5) {
        const railLen = xEnd - xStart
        const rail = createMesh(new THREE.CylinderGeometry(0.03, 0.03, railLen, 6), mats.scaffolding)
        rail.rotation.z = Math.PI / 2
        rail.position.set((xStart + xEnd) / 2, y, z)
        group.add(rail)

        const rail2 = createMesh(new THREE.CylinderGeometry(0.03, 0.03, railLen, 6), mats.scaffolding)
        rail2.rotation.z = Math.PI / 2
        rail2.position.set((xStart + xEnd) / 2, y, z + 1.2)
        group.add(rail2)
    }
}

/* ---- BUILDING GEOMETRY ---- */
function buildSceneGeometry() {
    // Ground / plaza
    const plaza = createMesh(new THREE.BoxGeometry(100, 0.2, 80), mats.plaza, false, true)
    plaza.position.set(0, -0.1, 0)
    groups.ground.add(plaza)

    // Dirt patch (excavated area)
    const dirt = createMesh(new THREE.BoxGeometry(28, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.95 }), false, true)
    dirt.position.set(0, -0.05, 0)
    groups.ground.add(dirt)

    // Front lawn
    const lawnFront = createMesh(new THREE.BoxGeometry(28, 0.22, 4), mats.grass, false, true)
    lawnFront.position.set(0, -0.08, 12)
    groups.ground.add(lawnFront)

    // Foundation
    groups.foundation.add(setPos(createMesh(new THREE.BoxGeometry(25, 0.4, 14), mats.concreteDark), 0, 0.2, 0))
    groups.foundation.add(setPos(createMesh(new THREE.BoxGeometry(15, 0.2, 1.4), mats.concreteFrame), 0, 0.1, 7.2))

    // Rebar stubs in foundation
    const rebarGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6)
    const rebarPositions = [-9.8, -5.8, -1.9, 1.9, 5.8, 9.8]
    rebarPositions.forEach((x) => {
        const rebar = createMesh(rebarGeo, mats.rebar)
        rebar.position.set(x, 0.8, 6.0)
        groups.foundation.add(rebar)
    })

    // Lower scaffolding
    createScaffoldingSection(-11.5, 11.5, 0.4, 5.5, 5.5, groups.scaffoldingLower)

    // Core walls
    groups.coreWalls.add(setPos(createMesh(new THREE.BoxGeometry(23.5, 12.5, 7.0), mats.concreteFrame), 0, 6.5, -1.0))

    // Columns
    const colX = [-9.8, -5.8, -1.9, 1.9, 5.8, 9.8]
    colX.forEach((x) => {
        groups.columns.add(setPos(createMesh(new THREE.BoxGeometry(0.85, 4.3, 0.85), mats.graniteColumn), x, 2.15, 6.0))
    })

    // Canopy
    groups.canopy.add(setPos(createMesh(new THREE.BoxGeometry(25.5, 0.55, 6.5), mats.concreteDark), 0, 4.6, 4.2))

    // Upper scaffolding
    createScaffoldingSection(-11.5, 11.5, 4.6, 14, 5.5, groups.scaffoldingUpper)

    // Upper frame
    groups.upperFrame.add(setPos(createMesh(new THREE.BoxGeometry(24.5, 2.2, 1.2), mats.concreteFrame), 0, 13.2, 3.8))
    groups.upperFrame.add(setPos(createMesh(new THREE.BoxGeometry(24.5, 0.8, 1.2), mats.concreteFrame), 0, 4.8, 3.8))
    groups.upperFrame.add(setPos(createMesh(new THREE.BoxGeometry(1.2, 7.8, 1.2), mats.concreteFrame), -11.65, 8.8, 3.8))
    groups.upperFrame.add(setPos(createMesh(new THREE.BoxGeometry(1.2, 7.8, 1.2), mats.concreteFrame), 11.65, 8.8, 3.8))
    groups.upperFrame.add(setPos(createMesh(new THREE.BoxGeometry(1.3, 7.8, 1.2), mats.concreteFrame), 0, 8.8, 3.8))

    // Wood louvers
    groups.woodLouvers.add(setPos(createMesh(new THREE.BoxGeometry(10.2, 7.5, 0.15), mats.woodBacking), -5.8, 8.8, 3.5))
    groups.woodLouvers.add(setPos(createMesh(new THREE.BoxGeometry(10.2, 7.5, 0.15), mats.woodBacking), 5.8, 8.8, 3.5))

    const addSlatBay = (xStart: number, xEnd: number) => {
        const width = 0.14
        const gap = 0.16
        for (let x = xStart; x <= xEnd; x += width + gap) {
            const slat = createMesh(new THREE.BoxGeometry(width, 7.5, 0.28), mats.woodSlat)
            groups.woodLouvers.add(setPos(slat, x, 8.8, 3.75))
        }
    }
    addSlatBay(-10.8, -0.85)
    addSlatBay(0.85, 10.8)

    // Side louvers
    groups.woodLouvers.add(setPos(createMesh(new THREE.BoxGeometry(0.2, 7.6, 8.5), mats.woodBacking), -11.7, 8.8, -0.5))
    for (let z = -4.5; z <= 3.2; z += 0.3) {
        groups.woodLouvers.add(setPos(createMesh(new THREE.BoxGeometry(0.26, 7.5, 0.12), mats.woodSlat), -11.85, 8.8, z))
    }

    // Glass storefront
    groups.glassStorefront.add(setPos(createMesh(new THREE.BoxGeometry(21, 3.8, 0.1), mats.glass, false, false), 0, 2.1, 3.0))
    for (let i = 0; i < 3; i++) {
        groups.glassStorefront.add(setPos(createMesh(new THREE.BoxGeometry(21, 0.28, 0.11), mats.glassFrost, false, false), 0, 1.0 + i * 1.05, 3.05))
    }

    // Final scaffolding removal is just the same scaffolding groups (they'll animate out)
    // We use the scaffoldingFinal group as a placeholder so the timeline has something
    // Actually, let's put nothing here; the scaffolding groups will be animated out instead.

    // Sign
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 2048, 256)
    ctx.font = '700 86px Arial, Helvetica, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#E8EDF2'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 3
    ctx.fillText('L TINSAY DEVELOPMENT CENTER', 1024, 128)

    const signTex = new THREE.CanvasTexture(canvas)
    signTex.anisotropy = 8
    const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(17, 2.0),
        new THREE.MeshStandardMaterial({ map: signTex, transparent: true, roughness: 0.3, metalness: 0.85 })
    )
    signMesh.position.set(0, 13.2, 4.45)
    groups.details.add(signMesh)

        // Landscaping
        ;[-5, -3.2, 4.8, 6.2].forEach((x) => {
            const bush = createMesh(new THREE.SphereGeometry(0.55, 12, 10), mats.plant)
            bush.scale.y = 0.65
            bush.position.set(x, 0.4, 9.8)
            groups.details.add(bush)
        })

    // Prepare all groups for animation
    BUILD_ORDER.forEach((key) => {
        groups[key].children.forEach((c) => {
            c.visible = false
            if (c instanceof THREE.Mesh || c instanceof THREE.Object3D) {
                c.scale.set(1, 0.001, 1)
                    ; (c as any)._origY = c.position.y
                c.position.y -= 0.5
            }
        })
    })
}

function updateProgress(pct: number) {
    if (progressFill.value) {
        progressFill.value.style.width = `${Math.round(pct)}%`
    }
    if (progressText.value) {
        progressText.value.textContent = `${Math.round(pct)}%`
    }
}

function updatePhaseLabel(phase: string) {
    if (phaseLabelText.value) {
        phaseLabelText.value.textContent = phase
    }
}

function playConstructionAnimation() {
    masterTimeline?.kill()

    // Reset everything
    BUILD_ORDER.forEach((key) => {
        groups[key].children.forEach((c) => {
            c.visible = false
            c.scale.set(1, 0.001, 1)
            if ((c as any)._origY !== undefined) {
                c.position.y = (c as any)._origY - 0.5
            }
        })
    })

        // Reset scaffolding visibility + shadows (for replay)
        ;[groups.scaffoldingLower, groups.scaffoldingUpper].forEach((group) => {
            group.children.forEach((c) => {
                if (c instanceof THREE.Mesh) {
                    const mat = c.material as THREE.MeshStandardMaterial
                    mat.opacity = 0.7
                    mat.transparent = true
                    c.visible = false
                    c.castShadow = true
                    c.receiveShadow = true
                    c.scale.set(1, 0.001, 1)
                    if ((c as any)._origY !== undefined) {
                        c.position.y = (c as any)._origY - 0.5
                    }
                }
            })
        })
    camera.position.set(12, 4, 36)
    controls.target.set(-6.5, 3, 0)
    controls.autoRotate = false
    controls.enabled = false

    if (textReveal.value) {
        textReveal.value.style.opacity = '0'
        textReveal.value.style.transform = 'translateY(1.5rem)'
    }

    if (progressBar.value) {
        progressBar.value.style.opacity = '0'
    }

    if (phaseLabel.value) {
        phaseLabel.value.style.opacity = '0'
    }

    updateProgress(0)

    masterTimeline = gsap.timeline({
        onComplete: () => {
            controls.enabled = true
            controls.autoRotate = true
            controls.autoRotateSpeed = 0.25
        },
    })

    // Show progress bar
    masterTimeline.to(progressBar.value, { opacity: 1, duration: 0.5 }, 0)
    masterTimeline.to(phaseLabel.value, { opacity: 1, duration: 0.5 }, 0)

    // Camera movement — slow cinematic sweep
    masterTimeline.to(camera.position, { x: 6, y: 6, z: 30, duration: 5, ease: 'power1.inOut' }, 0)
    masterTimeline.to(camera.position, { x: 10, y: 9, z: 26, duration: 7, ease: 'power1.inOut' }, 5)
    masterTimeline.to(controls.target, { x: -6.5, y: 5.5, z: 0, duration: 12, ease: 'power1.inOut' }, 0)

    const totalPhases = BUILD_ORDER.length
    let currentTime = 0.3

    BUILD_ORDER.forEach((key, phaseIndex) => {
        const isScaffoldRemoval = key === 'scaffoldingFinal'
        const phaseName = PHASE_NAMES[key] || key
        const children = groups[key].children

        // Phase label update
        masterTimeline!.add(() => {
            updatePhaseLabel(phaseName)
        }, currentTime)

        // In playConstructionAnimation(), replace the isScaffoldRemoval block:

        if (isScaffoldRemoval) {
            const allScaffoldChildren = [
                ...groups.scaffoldingLower.children,
                ...groups.scaffoldingUpper.children,
            ]

            masterTimeline!.add(() => {
                spawnDust(-6.5, 3, 8, 60)
            }, currentTime)

            allScaffoldChildren.forEach((c) => {
                if (c instanceof THREE.Mesh) {
                    const mat = c.material as THREE.MeshStandardMaterial
                    // Fade out visually
                    masterTimeline!.to(mat, {
                        opacity: 0,
                        duration: 1.2,
                        ease: 'power2.in',
                        onComplete: () => {
                            // Fully remove so shadows disappear too
                            c.visible = false
                            c.castShadow = false
                            c.receiveShadow = false
                        },
                    }, currentTime)
                }
            })

            masterTimeline!.to({}, {
                duration: 1.5,
                onUpdate: function () {
                    const p = ((phaseIndex + this.progress()) / totalPhases) * 100
                    updateProgress(p)
                },
            }, currentTime)

            currentTime += 1.8
        } else if (children.length === 0) {
            currentTime += 0.3
        } else {
            // Dust at phase start
            masterTimeline!.add(() => {
                const bounds = new THREE.Box3().setFromObject(groups[key])
                const center = bounds.getCenter(new THREE.Vector3())
                spawnDust(center.x + buildingGroup.position.x, center.y, center.z, 30 + children.length * 2)
            }, currentTime)

            // Animate children rising up
            const stagger = Math.min(0.06, 1.5 / Math.max(children.length, 1))
            const duration = key === 'woodLouvers' ? 0.5 : 0.7

            children.forEach((c, ci) => {
                const t = currentTime + ci * stagger
                const origY = (c as any)._origY ?? c.position.y

                masterTimeline!.add(() => {
                    c.visible = true
                }, t)

                masterTimeline!.to(c.scale, {
                    y: 1,
                    duration,
                    ease: key === 'columns' ? 'elastic.out(1, 0.8)' : 'power3.out',
                }, t)

                masterTimeline!.to(c.position, {
                    y: origY,
                    duration: duration * 0.8,
                    ease: 'power2.out',
                }, t)
            })

            const phaseDuration = stagger * children.length + duration

            // Progress update
            masterTimeline!.to({}, {
                duration: phaseDuration,
                onUpdate: function () {
                    const p = ((phaseIndex + this.progress()) / totalPhases) * 100
                    updateProgress(p)
                },
            }, currentTime)

            currentTime += phaseDuration + 0.3
        }
    })

    // Final reveal
    masterTimeline.add(() => {
        updateProgress(100)
        updatePhaseLabel('Complete')

        if (textReveal.value) {
            textReveal.value.style.opacity = '1'
            textReveal.value.style.transform = 'translateY(0)'
        }
    }, currentTime)

    // Fade out progress bar after completion
    masterTimeline.to(progressBar.value, { opacity: 0, duration: 1, delay: 2 }, currentTime)
    masterTimeline.to(phaseLabel.value, { opacity: 0, duration: 1, delay: 2 }, currentTime)
}

function replayAnimation() {
    controls.autoRotate = false
    controls.enabled = false
    playConstructionAnimation()
}

function handleResize() {
    if (!canvasContainer.value || !camera || !renderer) return
    const width = canvasContainer.value.clientWidth
    const height = canvasContainer.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}
</script>
