<template>
  <div
    class="fixed inset-0 z-50 bg-appleCore-50/95 backdrop-blur-md text-blueberry-900 flex flex-col overflow-hidden animate-fadeIn"
    role="dialog"
    aria-modal="true"
  >
    <!-- Header -->
    <header
      class="relative z-30 w-full max-w-6xl mx-auto px-5 sm:px-6 py-4
             flex items-center justify-between border-b border-appleCore-200/50 bg-white/70 backdrop-blur-md"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-white border border-apricot-200 shadow-sm flex items-center justify-center overflow-hidden">
          <img src="/tri.png" alt="Tricastle" class="w-7 h-7 object-contain" @error="hideImg" />
        </div>
        <div class="min-w-0">
          <h2 class="text-base font-serif font-extrabold text-blueberry-900 truncate tracking-tight">
            Tricastle International
          </h2>
          <p class="text-[9px] text-apricot-600 font-bold uppercase tracking-widest">
            Company Experience
          </p>
        </div>
      </div>

      <button
        type="button"
        class="w-9 h-9 rounded-full bg-white border border-appleCore-200
               hover:bg-apricot-500 hover:text-white hover:border-apricot-500 text-blueberry-700
               flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
        @click="$emit('close')"
      >
        <i class="pi pi-times text-xs" />
      </button>
    </header>

    <!-- Tabs: Corporate Profile · Principles · Developer -->
    <div class="relative z-30 w-full max-w-6xl mx-auto px-5 sm:px-6 pt-4 pb-2">
      <div
        class="flex flex-wrap items-center justify-center gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-appleCore-200/40 shadow-sm w-fit mx-auto"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          :class="
            activeTab === tab.id
              ? 'bg-apricot-500 text-white border-apricot-500 shadow-md shadow-apricot-500/20'
              : 'bg-white/80 text-blueberry-750 border-transparent hover:bg-apricot-50'
          "
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon" class="text-[10px]" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <main class="relative z-20 flex-1 overflow-y-auto custom-scroll animate-fadeIn">
      <div class="w-full max-w-4xl mx-auto px-5 sm:px-6 py-4 space-y-6 pb-20">

        <!-- ===================== CORPORATE PROFILE ===================== -->
        <section v-if="activeTab === 'about'" class="space-y-6">
          <!-- Branded Hero Banner -->
          <div
            class="relative w-full rounded-3xl overflow-hidden shadow-md border border-appleCore-200/60 bg-gradient-to-r from-blueberry-950 via-blueberry-900 to-blueberry-950 p-6 sm:p-8 flex items-center justify-between slide-up"
          >
            <div class="relative z-10 max-w-lg space-y-2">
              <span class="inline-block text-[10px] font-bold text-apricot-400 uppercase tracking-widest bg-apricot-500/20 px-3 py-1 rounded-full border border-apricot-400/30">
                Tricastle International, Inc.
              </span>
              <h3 class="text-white font-serif text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
                Building the Future Together
              </h3>
              <p class="text-appleCore-200 text-xs font-medium leading-relaxed">
                Not just a workforce, but a family and corporate partner constructing dreams.
              </p>
            </div>

            <!-- Contained Logo Emblem on Right -->
            <div class="hidden sm:flex w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 items-center justify-center p-3 flex-shrink-0 shadow-inner">
              <img src="/tri.png" alt="Tricastle Emblem" class="w-full h-full object-contain drop-shadow-md" />
            </div>
          </div>

          <!-- Leadership Cards Grid -->
          <div class="space-y-3">
            <h3
              class="text-sm font-serif font-bold text-blueberry-900 flex items-center gap-2 px-1 slide-up"
              style="animation-delay: 0.1s"
            >
              <i class="pi pi-users text-apricot-500" />
              Leadership
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div
                v-for="(member, idx) in leadership"
                :key="member.name"
                class="team-card bg-white rounded-3xl overflow-hidden shadow-sm border border-appleCore-200/80 group hover:shadow-md hover:border-apricot-300 transition-all duration-300"
                :style="{ animationDelay: `${idx * 0.1 + 0.15}s` }"
              >
                <!-- Aspect Ratio Container guarantees face is not cropped too close -->
                <div class="aspect-[4/5] w-full overflow-hidden relative bg-slate-100">
                  <img
                    :src="member.img"
                    :alt="member.name"
                    class="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-700 ease-out"
                    @error="hideImg"
                  />
                </div>
                <div class="p-4 text-center bg-white border-t border-appleCore-100">
                  <h4 class="text-sm font-serif font-bold text-blueberry-900 leading-snug">{{ member.name }}</h4>
                  <p class="text-[9.5px] font-bold text-apricot-600 uppercase tracking-widest mt-1">
                    {{ member.role }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Milestones -->
          <div
            class="bg-white/80 backdrop-blur-md rounded-3xl border border-appleCore-200/80 p-6 shadow-sm slide-up"
            style="animation-delay: 0.45s"
          >
            <h3 class="text-sm font-serif font-bold text-blueberry-900 flex items-center gap-2 mb-5">
              <i class="pi pi-history text-apricot-500" />
              Historical Milestones
            </h3>
            <div class="space-y-5 border-l-2 border-apricot-300 pl-5 ml-2 relative">
              <div v-for="item in milestones" :key="item.year" class="relative">
                <span class="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-white border-2 border-apricot-500 shadow-sm" />
                <p class="font-bold text-apricot-600 text-[11px] uppercase tracking-wider">{{ item.year }}</p>
                <p class="text-blueberry-750 text-xs mt-1 leading-relaxed max-w-2xl">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ===================== PRINCIPLES ===================== -->
        <section v-if="activeTab === 'principles'" class="space-y-4 pt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="(p, idx) in principles"
              :key="p.title"
              class="bg-white/90 backdrop-blur-md rounded-3xl border border-appleCore-200/80 p-5 shadow-sm flex gap-4 slide-up hover:-translate-y-1 transition-transform duration-300"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            >
              <span
                class="w-10 h-10 rounded-2xl bg-gradient-to-br from-apricot-400 to-apricot-600 text-white text-sm font-black flex items-center justify-center flex-shrink-0 shadow-md"
              >
                0{{ idx + 1 }}
              </span>
              <div>
                <h4 class="font-serif font-bold text-blueberry-900 text-sm">{{ p.title }}</h4>
                <p class="text-xs text-blueberry-600 mt-1.5 leading-relaxed">{{ p.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ===================== DEVELOPER ===================== -->
        <section v-if="activeTab === 'developer'" class="space-y-6 pt-1">
          <!-- Hero Developer Card -->
          <div
            class="slide-up relative overflow-hidden rounded-3xl border border-white/80 bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl"
          >
            <div class="relative flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <!-- Photo Aspect Ratio Frame -->
              <div
                class="w-40 sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-apricot-300/80 shadow-md flex-shrink-0 bg-slate-100 group"
              >
                <img
                  :src="developer.img"
                  :alt="developer.name"
                  class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  @error="hideImg"
                />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0 text-center sm:text-left space-y-3">
                <div class="flex items-center justify-center sm:justify-start">
                  <span
                    class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-apricot-500 px-3 py-1 rounded-full shadow-sm"
                  >
                    <i class="pi pi-code text-[10px]" />
                    Developer
                  </span>
                </div>

                <h3 class="text-3xl sm:text-4xl font-serif font-extrabold text-blueberry-950 tracking-tight leading-tight">
                  {{ developer.name }}
                </h3>

                <p class="text-xs font-bold text-apricot-600 uppercase tracking-widest">
                  {{ developer.role }}
                </p>

                <p class="text-sm text-blueberry-800 leading-relaxed max-w-lg font-medium">
                  {{ developer.bio }}
                </p>

                <div class="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                  <span
                    v-for="tag in developer.tags"
                    :key="tag"
                    class="text-[11px] font-bold px-3 py-1 rounded-full bg-blueberry-900 text-white shadow-sm"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="(card, idx) in developerCards"
              :key="card.title"
              class="slide-up bg-white/90 backdrop-blur-md rounded-2xl border border-appleCore-200/80 p-4 shadow-sm"
              :style="{ animationDelay: `${0.15 + idx * 0.08}s` }"
            >
              <div
                class="w-9 h-9 rounded-xl bg-apricot-50 border border-apricot-200 text-apricot-600 flex items-center justify-center mb-3"
              >
                <i :class="card.icon" class="text-sm" />
              </div>
              <h4 class="text-xs font-serif font-bold text-blueberry-900">{{ card.title }}</h4>
              <p class="text-[11px] text-blueberry-600 mt-1 leading-relaxed">{{ card.desc }}</p>
            </div>
          </div>

          <p
            class="slide-up text-center text-[11px] text-blueberry-500 font-medium"
            style="animation-delay: 0.4s"
          >
            Engineered & Developed by
            <span class="font-bold text-blueberry-900">{{ developer.name }}</span>
            · Tricastle Bacolod Portal
          </p>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer
      class="relative z-30 w-full max-w-6xl mx-auto px-5 sm:px-6 py-3 flex items-center justify-between text-[10px] text-blueberry-600 border-t border-appleCore-200/60 bg-white/70 backdrop-blur-md mt-auto"
    >
      <p class="font-medium">Tricastle International, Inc. · Bacolod</p>
      <p class="font-bold text-apricot-600 tracking-wide">
        We Build Dreams to Construct the Future
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

type TabId = 'about' | 'principles' | 'developer'

const props = withDefaults(
  defineProps<{ initialTab?: TabId | 'team' }>(),
  { initialTab: 'about' },
)

defineEmits<{ close: [] }>()

function normalizeTab(v: TabId | 'team' | undefined): TabId {
  if (v === 'principles') return 'principles'
  if (v === 'developer' || v === 'team') return 'developer'
  return 'about'
}

const activeTab = ref<TabId>(normalizeTab(props.initialTab))

watch(
  () => props.initialTab,
  (v) => {
    activeTab.value = normalizeTab(v)
  },
)

const tabs = [
  { id: 'about' as const, label: 'Corporate Profile', icon: 'pi pi-id-card' },
  { id: 'principles' as const, label: 'Principles', icon: 'pi pi-compass' },
  { id: 'developer' as const, label: 'Developer', icon: 'pi pi-code' },
]

/** Leadership only — Leah, Koyama, Johnny */
const leadership = [
  {
    name: 'Leah Tinsay',
    role: 'President / Managing Director',
    img: '/about/leah-tinsay.jpg',
  },
  {
    name: 'Toshiki Koyama',
    role: 'Japanese Partner',
    img: '/about/toshiki-koyama.jpg',
  },
  {
    name: 'Johnny Reosura',
    role: 'Operations Manager',
    img: '/about/johnny-reosura.jpg',
  },
]

/** Developer tab content */
const developer = {
  name: 'Ralph Barioga',
  role: 'Lead Developer & Engineer',
  img: '/about/ralph-barioga.jpg',
  bio: 'Engineers the Tricastle digital platform — secure portals, interactive experiences, and systems that connect people, projects, and progress.',
  tags: ['Vue 3', 'TypeScript', 'Three.js', 'Full-Stack'],
}

const developerCards = [
  {
    title: 'Platform Engineering',
    desc: 'Auth, dashboards, and reliable APIs built for real company workflows.',
    icon: 'pi pi-server',
  },
  {
    title: 'Interactive UX',
    desc: 'Premium UI and 3D landing experiences that reflect Tricastle’s brand.',
    icon: 'pi pi-sparkles',
  },
  {
    title: 'Product Focus',
    desc: 'Clean architecture, performance, and maintainable TypeScript code.',
    icon: 'pi pi-bolt',
  },
]

const milestones = [
  {
    year: 'November 1999 · Bacolod City',
    text: 'Started as a partnership between a Filipino entrepreneur and a Japanese construction cooperative to train local talents.',
  },
  {
    year: 'November 2005 · NJ BUILDERS GROUP',
    text: 'NJ BUILDERS GROUP, Inc. was established to place Japan OJT graduates into professional construction work.',
  },
  {
    year: 'August 2013 · POEA License',
    text: 'Tricastle International, Inc. was established as a POEA-licensed recruitment agency.',
  },
]

const principles = [
  { title: 'PUNCTUALITY is a MUST!', desc: 'Be on time, all the time. (Time is Treasure)' },
  { title: 'DISCIPLINE & CONCERN', desc: 'Self-control and care for the team.' },
  { title: 'ALWAYS BE A GENTLEMAN', desc: 'Respect, courtesy, and integrity.' },
  { title: 'TRUST & HONESTY', desc: 'The foundation of every relationship.' },
]

function hideImg(e: Event) {
  ;(e.target as HTMLElement).style.display = 'none'
}
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(247, 136, 47, 0.4);
  border-radius: 999px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up,
.team-card {
  opacity: 0;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>