<template>
  <div class="landing-root">
    <div
      class="min-h-screen bg-[#080c14] text-white font-sans overflow-x-hidden"
    >
      <!-- ─────────────── NAVBAR ─────────────── -->
      <Motion
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
      >
        <nav
          class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 h-16 backdrop-blur-2xl bg-[#080c14]/80 border-b border-white/[0.05]"
        >
          <div class="flex items-center gap-3">
            <NexusLogo :size="32" />
            <span
              class="text-sm font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400"
              >NexusHR</span
            >
          </div>

          <div class="hidden md:flex items-center gap-8">
            <a
              v-for="link in navLinks"
              :key="link.label"
              :href="link.href"
              class="text-xs font-bold text-slate-500 hover:text-slate-200 transition-colors tracking-widest uppercase"
            >
              {{ link.label }}
            </a>
          </div>

          <NuxtLink
            to="/login"
            class="flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 transition-all duration-200 tracking-widest uppercase"
          >
            <i class="bi bi-box-arrow-in-right"></i>
            Access Demo
          </NuxtLink>
        </nav>
      </Motion>

      <!-- ─────────────── HERO ─────────────── -->
      <section
        id="home"
        class="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6"
      >
        <!-- Background noise & orbs -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]"
          ></div>
          <div
            class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]"
          ></div>
          <!-- Dot grid -->
          <div
            class="absolute inset-0"
            style="
              background-image: radial-gradient(
                circle,
                rgba(99, 102, 241, 0.08) 1px,
                transparent 1px
              );
              background-size: 40px 40px;
            "
          ></div>
        </div>

        <div
          class="relative z-10 max-w-5xl mx-auto w-full text-center space-y-8"
        >
          <!-- Tag -->
          <Motion
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.1 }"
          >
            <div
              class="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03]"
            >
              <div class="flex items-center gap-1.5">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                ></span>
                <span
                  class="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400"
                  >Open Demo</span
                >
              </div>
              <div class="w-px h-3 bg-white/10"></div>
              <span class="text-[10px] font-bold text-slate-500 tracking-widest"
                >Full-Stack HRIS Project</span
              >
            </div>
          </Motion>

          <!-- Headline -->
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.2 }"
          >
            <div class="space-y-4">
              <h1
                class="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.95]"
              >
                <span class="text-slate-300">Human</span><br />
                <span
                  class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300"
                >
                  Resource </span
                ><br />
                <span class="text-slate-300">Intelligence.</span>
              </h1>
            </div>
          </Motion>

          <!-- Desc -->
          <Motion
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ delay: 0.35 }"
          >
            <p
              class="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            >
              A full-stack HR management system powered by
              <span class="text-slate-300 font-semibold">Nuxt 3</span>, architected
              with modular enterprise standards — spanning attendance tracking, commute allowances,
              leave governance, security audit logs, and granular role-based access control.
            </p>
          </Motion>

          <!-- CTA -->
          <Motion
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.45 }"
          >
            <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
              <NuxtLink to="/login">
                <button
                  class="group flex items-center gap-3 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black tracking-wide transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                >
                  Try Live Demo
                  <i
                    class="bi bi-arrow-right text-indigo-300 group-hover:translate-x-1 transition-transform"
                  ></i>
                </button>
              </NuxtLink>
              <a href="#stack">
                <button
                  class="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20 text-sm font-bold tracking-wide transition-all duration-200 bg-white/[0.02] hover:bg-white/[0.05]"
                >
                  <i class="bi bi-code-slash"></i>
                  Tech Stack
                </button>
              </a>
            </div>
          </Motion>

          <!-- Tech pill strip -->
          <Motion
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ delay: 0.6 }"
          >
            <div class="flex flex-wrap items-center justify-center gap-2 pt-4">
              <span
                v-for="tech in techPills"
                :key="tech.name"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[10px] font-bold text-slate-500 tracking-widest uppercase hover:border-indigo-500/30 hover:text-indigo-400 transition-colors cursor-default"
              >
                <i :class="tech.icon + ' text-[11px]'"></i>
                {{ tech.name }}
              </span>
            </div>
          </Motion>
        </div>

        <!-- Scroll indicator -->
        <div
          class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span class="text-[9px] font-bold uppercase tracking-[0.3em]"
            >Scroll</span
          >
          <div
            class="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent"
          ></div>
        </div>
      </section>

      <!-- ─────────────── PREVIEW / MOCKUP ─────────────── -->
      <section class="relative py-24 px-6 overflow-hidden">
        <div
          class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
        ></div>

        <Motion
          :initial="{ opacity: 0, y: 40 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.7 }"
          class="max-w-5xl mx-auto"
        >
          <!-- Label -->
          <div class="text-center mb-10 space-y-2">
            <div
              class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600"
            >
              System Preview
            </div>
            <div class="text-2xl font-black text-slate-300 tracking-tight">
              Dashboard Intelligence Center
            </div>
          </div>

          <!-- Dashboard Mockup -->
          <div class="relative">
            <!-- Glow -->
            <div
              class="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-3xl scale-95"
            ></div>

            <div
              class="relative rounded-2xl border border-white/[0.07] bg-[#0d1117] overflow-hidden shadow-2xl"
            >
              <!-- Browser chrome -->
              <div
                class="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05] bg-white/[0.02]"
              >
                <div class="flex gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                </div>
                <div
                  class="flex-1 mx-4 px-4 py-1 rounded-md bg-white/[0.04] border border-white/[0.05] flex items-center gap-2"
                >
                  <i class="bi bi-lock-fill text-[8px] text-slate-600"></i>
                  <span class="text-[10px] font-mono text-slate-600"
                    >nexushr.io/dashboard</span
                  >
                </div>
              </div>

              <!-- App chrome: sidebar + content -->
              <div class="flex" style="height: 340px">
                <!-- Mini sidebar -->
                <div
                  class="w-14 border-r border-white/[0.05] bg-[#080c14] flex flex-col items-center py-5 gap-4 flex-shrink-0"
                >
                  <NexusLogo :size="28" />
                  <div class="w-px h-4 bg-white/[0.05]"></div>
                  <div
                    v-for="ico in [
                      'bi-grid-fill',
                      'bi-people-fill',
                      'bi-calendar-check-fill',
                      'bi-calendar2-week-fill',
                      'bi-cash-stack',
                    ]"
                    :key="ico"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors cursor-default"
                  >
                    <i :class="'bi ' + ico + ' text-[13px] text-slate-600'"></i>
                  </div>
                </div>

                <!-- Main content -->
                <div class="flex-1 p-6 overflow-hidden space-y-5">
                  <!-- top bar -->
                  <div class="flex items-center justify-between">
                    <div>
                      <div
                        class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600"
                      >
                        Intelligence Center
                      </div>
                      <div class="text-sm font-black text-slate-300">
                        Good Morning 👋
                      </div>
                    </div>
                    <div
                      class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <div
                        class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"
                      ></div>
                      <span
                        class="text-[9px] font-black text-emerald-400 uppercase tracking-widest"
                        >Live</span
                      >
                    </div>
                  </div>

                  <!-- stat cards -->
                  <div class="grid grid-cols-4 gap-3">
                    <div
                      v-for="card in previewCards"
                      :key="card.label"
                      class="p-3 rounded-xl border border-white/[0.05]"
                      :class="card.bg"
                    >
                      <div
                        class="text-[8px] font-black uppercase tracking-widest mb-1.5"
                        :class="card.tc"
                      >
                        {{ card.label }}
                      </div>
                      <div class="text-xl font-black text-white">
                        {{ card.val }}
                      </div>
                    </div>
                  </div>

                  <!-- chart mockup -->
                  <div
                    class="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]"
                  >
                    <div
                      class="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 mb-3"
                    >
                      Employment Distribution
                    </div>
                    <div class="flex items-end gap-1.5 h-14">
                      <div
                        v-for="(h, i) in [
                          65, 80, 45, 90, 55, 75, 40, 85, 60, 95, 70, 50,
                        ]"
                        :key="i"
                        class="flex-1 rounded-sm opacity-70"
                        :class="
                          i % 3 === 0
                            ? 'bg-indigo-500'
                            : i % 3 === 1
                              ? 'bg-violet-500'
                              : 'bg-indigo-400'
                        "
                        :style="{ height: h + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Motion>
      </section>

      <!-- ─────────────── FEATURES / MODULES ─────────────── -->
      <section id="modules" class="relative py-28 px-6">
        <div
          class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
        ></div>

        <div class="max-w-5xl mx-auto">
          <div class="mb-16 space-y-3">
            <div
              class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600"
            >
              What We Built
            </div>
            <h2
              class="text-3xl md:text-4xl font-black tracking-tight text-slate-200"
            >
              Integrated<br />Modules.
            </h2>
            <p class="text-slate-600 text-sm max-w-md leading-relaxed">
              Each module is engineered with production-ready business logic,
              full validation safeguards, and role-based access control.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(mod, i) in modules"
              :key="mod.title"
              class="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all duration-300 cursor-default"
            >
              <div class="flex items-start gap-4 mb-4">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  :class="mod.iconBg"
                >
                  <i :class="mod.icon + ' text-base'"></i>
                </div>
                <div>
                  <div class="text-sm font-black text-slate-200">
                    {{ mod.title }}
                  </div>
                  <div
                    class="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5"
                  >
                    {{ mod.sub }}
                  </div>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                {{ mod.desc }}
              </p>
              <div class="flex flex-wrap gap-1.5 mt-4">
                <span
                  v-for="tag in mod.tags"
                  :key="tag"
                  class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                  :class="mod.tagCls"
                  >{{ tag }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─────────────── TECH STACK ─────────────── -->
      <section id="stack" class="relative py-28 px-6">
        <div
          class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
        ></div>

        <div class="max-w-5xl mx-auto">
          <div class="mb-16 space-y-3">
            <div
              class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600"
            >
              Technologies
            </div>
            <h2
              class="text-3xl md:text-4xl font-black tracking-tight text-slate-200"
            >
              Tech Stack.
            </h2>
            <p class="text-slate-600 text-sm max-w-md leading-relaxed">
              Built entirely with cutting-edge tools — unified frontend, backend server engine,
              and database in a single Nuxt monorepo.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="layer in stackLayers"
              :key="layer.label"
              class="space-y-3"
            >
              <div
                class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 pb-2 border-b border-white/[0.05]"
              >
                {{ layer.label }}
              </div>
              <div
                v-for="tech in layer.items"
                :key="tech.name"
                class="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all duration-200 group"
              >
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  :class="tech.bg"
                >
                  <i :class="tech.icon"></i>
                </div>
                <div>
                  <div class="text-xs font-black text-slate-300">
                    {{ tech.name }}
                  </div>
                  <div class="text-[10px] text-slate-600">{{ tech.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─────────────── ACCESS / CTA ─────────────── -->
      <section id="demo" class="relative py-28 px-6">
        <div
          class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"
        ></div>

        <div class="max-w-3xl mx-auto text-center space-y-8">
          <div class="space-y-4">
            <div
              class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600"
            >
              Interactive Demo
            </div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight">
              <span class="text-slate-300">Experience It</span><br />
              <span
                class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400"
                >Live.</span
              >
            </h2>
            <p class="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto">
              This system is connected to a live database. Sign in with demo credentials
              to explore all enterprise features instantly without any setup required.
            </p>
          </div>

          <!-- Demo credentials card -->
          <div
            class="inline-block p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left space-y-3 w-full max-w-sm mx-auto"
          >
            <div
              class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4"
            >
              Demo Credentials
            </div>
            <div class="space-y-2">
              <div
                class="flex items-center justify-between py-2 border-b border-white/[0.05]"
              >
                <span
                  class="text-[10px] font-bold text-slate-600 uppercase tracking-wider"
                  >Username</span
                >
                <code
                  class="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded"
                  >superadmin</code
                >
              </div>
              <div
                class="flex items-center justify-between py-2 border-b border-white/[0.05]"
              >
                <span
                  class="text-[10px] font-bold text-slate-600 uppercase tracking-wider"
                  >Password</span
                >
                <code
                  class="text-xs font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded"
                  >P@ssword123</code
                >
              </div>
              <div class="flex items-center justify-between py-2">
                <span
                  class="text-[10px] font-bold text-slate-600 uppercase tracking-wider"
                  >Role</span
                >
                <span
                  class="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider"
                  >Super Admin</span
                >
              </div>
            </div>
          </div>

          <NuxtLink to="/login" class="inline-block">
            <button
              class="group flex items-center gap-3 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black tracking-wide transition-all duration-200 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 mx-auto"
            >
              <NexusLogo :size="20" />
              Launch Application
              <i
                class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"
              ></i>
            </button>
          </NuxtLink>
        </div>
      </section>

      <!-- ─────────────── FOOTER ─────────────── -->
      <footer class="relative py-10 px-6 border-t border-white/[0.05]">
        <div
          class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div class="flex items-center gap-3">
            <NexusLogo :size="28" />
            <div>
              <div
                class="text-xs font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400"
              >
                NexusHR
              </div>
              <div
                class="text-[9px] font-bold text-slate-700 uppercase tracking-widest"
              >
                Enterprise System
              </div>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <a
              v-for="link in footerLinks"
              :key="link.label"
              :href="link.href"
              class="text-[10px] font-bold text-slate-700 hover:text-slate-400 transition-colors uppercase tracking-widest"
            >
              {{ link.label }}
            </a>
          </div>

          <div class="text-[10px] text-slate-700 font-mono">
            Built with Nuxt 3 + PostgreSQL
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

useHead({
  title: "NexusHR — Enterprise HR Intelligence",
  meta: [
    {
      name: "description",
      content:
        "Full-stack enterprise HR management system powered by Nuxt 3 — attendance tracking, commute allowances, leave governance, audit logs, and granular RBAC in one unified platform.",
    },
  ],
});

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Modules", href: "#modules" },
  { label: "Stack", href: "#stack" },
  { label: "Demo", href: "#demo" },
];

const techPills = [
  { name: "Nuxt 3", icon: "bi bi-layers-fill" },
  { name: "Vue 3", icon: "bi bi-box" },
  { name: "TypeScript", icon: "bi bi-filetype-tsx" },
  { name: "PostgreSQL", icon: "bi bi-database-fill" },
  { name: "Tailwind", icon: "bi bi-paint-bucket" },
  { name: "PrimeVue", icon: "bi bi-ui-checks" },
];

const previewCards = [
  {
    label: "Total Workforce",
    val: "248",
    bg: "bg-indigo-500/8 border-indigo-500/15",
    tc: "text-indigo-500",
  },
  {
    label: "Present Today",
    val: "214",
    bg: "bg-emerald-500/8 border-emerald-500/15",
    tc: "text-emerald-500",
  },
  {
    label: "On Leave",
    val: "12",
    bg: "bg-amber-500/8 border-amber-500/15",
    tc: "text-amber-500",
  },
  {
    label: "Interns",
    val: "31",
    bg: "bg-violet-500/8 border-violet-500/15",
    tc: "text-violet-500",
  },
];

const modules = [
  {
    icon: "bi bi-people-fill text-indigo-400",
    iconBg: "bg-indigo-500/15 border border-indigo-500/20",
    title: "Talent Directory",
    sub: "Employee Management",
    desc: "Comprehensive talent database featuring photo uploads, designation history, multidimensional filtering, and export capabilities.",
    tags: ["CRUD", "Upload", "Filter", "Export"],
    tagCls: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
  },
  {
    icon: "bi bi-calendar-check-fill text-emerald-400",
    iconBg: "bg-emerald-500/15 border border-emerald-500/20",
    title: "Presence Flow",
    sub: "Attendance Tracking",
    desc: "Monthly attendance records with present/leave/sick/absent tracking, daily summaries, and automated Excel exports.",
    tags: ["Real-time", "Monthly", "Excel Export"],
    tagCls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  },
  {
    icon: "bi bi-calendar2-week-fill text-amber-400",
    iconBg: "bg-amber-500/15 border border-amber-500/20",
    title: "Leave Governance",
    sub: "Leave Management",
    desc: "Leave requests backed by approval workflows, automated entitlement calculations, and team availability calendars.",
    tags: ["Workflow", "Approval", "Balance"],
    tagCls: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  },
  {
    icon: "bi bi-cash-stack text-violet-400",
    iconBg: "bg-violet-500/15 border border-violet-500/20",
    title: "Financial Logistics",
    sub: "Transport Allowance",
    desc: "Distance-based commute allowance calculations with threshold caps, bulk generation, and complete audit trails.",
    tags: ["Geo-calc", "Bulk Generate", "Audit"],
    tagCls: "bg-violet-500/10 text-violet-500 border border-violet-500/20",
  },
  {
    icon: "bi bi-shield-lock-fill text-rose-400",
    iconBg: "bg-rose-500/15 border border-rose-500/20",
    title: "Access Control",
    sub: "RBAC System",
    desc: "Granular role and permission management per module with SSE push notifications on live access changes.",
    tags: ["RBAC", "SSE", "Granular"],
    tagCls: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  },
  {
    icon: "bi bi-shield-shaded text-sky-400",
    iconBg: "bg-sky-500/15 border border-sky-500/20",
    title: "Security Audit",
    sub: "Activity Logging",
    desc: "Comprehensive system activity logs with timestamp, user, and module filtering. Supports compliant audit trail exports.",
    tags: ["Full Log", "Filter", "Compliance"],
    tagCls: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
  },
];

const stackLayers = [
  {
    label: "Frontend",
    items: [
      {
        name: "Nuxt 3",
        role: "Full-stack framework",
        icon: "bi bi-layers-fill text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        name: "Vue 3 Composition API",
        role: "Reactive UI layer",
        icon: "bi bi-box text-emerald-400",
        bg: "bg-emerald-500/10",
      },
      {
        name: "TailwindCSS",
        role: "Utility-first styling",
        icon: "bi bi-paint-bucket text-sky-400",
        bg: "bg-sky-500/10",
      },
      {
        name: "PrimeVue 4",
        role: "Component library",
        icon: "bi bi-ui-checks text-violet-400",
        bg: "bg-violet-500/10",
      },
      {
        name: "Motion-V",
        role: "Animations",
        icon: "bi bi-play-circle-fill text-amber-400",
        bg: "bg-amber-500/10",
      },
    ],
  },
  {
    label: "Backend",
    items: [
      {
        name: "Nuxt Server Routes",
        role: "API layer (H3)",
        icon: "bi bi-server text-indigo-400",
        bg: "bg-indigo-500/10",
      },
      {
        name: "JWT + Refresh Token",
        role: "Auth strategy",
        icon: "bi bi-key-fill text-amber-400",
        bg: "bg-amber-500/10",
      },
      {
        name: "SSE (Server-Sent Events)",
        role: "Real-time push",
        icon: "bi bi-broadcast text-rose-400",
        bg: "bg-rose-500/10",
      },
      {
        name: "Axios Interceptors",
        role: "HTTP client layer",
        icon: "bi bi-arrow-repeat text-slate-400",
        bg: "bg-slate-500/10",
      },
    ],
  },
  {
    label: "Database & Infra",
    items: [
      {
        name: "PostgreSQL",
        role: "Primary database",
        icon: "bi bi-database-fill text-sky-400",
        bg: "bg-sky-500/10",
      },
      {
        name: "postgres (npm driver)",
        role: "Typed SQL client",
        icon: "bi bi-plug-fill text-sky-400",
        bg: "bg-sky-500/10",
      },
      {
        name: "Docker Compose",
        role: "Dev environment",
        icon: "bi bi-box-seam-fill text-blue-400",
        bg: "bg-blue-500/10",
      },
      {
        name: "TypeScript",
        role: "Type safety end-to-end",
        icon: "bi bi-braces text-indigo-400",
        bg: "bg-indigo-500/10",
      },
    ],
  },
];

const footerLinks = [
  { label: "Modul", href: "#modules" },
  { label: "Stack", href: "#stack" },
  { label: "Demo", href: "#demo" },
];
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap");

.landing-root {
  font-family: "Plus Jakarta Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}
</style>
