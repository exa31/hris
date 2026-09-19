<template>
  <div class="landing-root min-h-screen bg-[#070a12] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
    <!-- ─────────────── NAVBAR ─────────────── -->
    <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#070a12]/85 border-b border-white/[0.06] transition-all duration-200">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <!-- Logo & Enterprise Badge -->
        <div class="flex items-center gap-3.5">
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <NexusLogo :size="36" />
            <div class="flex flex-col">
              <span class="text-base font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Nexus<span class="text-indigo-400">HR</span>
              </span>
              <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Enterprise Solution
              </span>
            </div>
          </NuxtLink>
          <div class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>v2.4 Production Ready</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden lg:flex items-center gap-8">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="text-xs font-bold text-slate-300 hover:text-white transition-colors tracking-wider uppercase hover:underline underline-offset-8 decoration-indigo-400/50"
          >
            {{ link.label }}
          </a>
        </nav>

        <!-- Action Button & Mobile Trigger -->
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/login"
            class="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-black tracking-wider uppercase transition-all duration-150 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40"
          >
            <i class="bi bi-box-arrow-in-right text-indigo-200 group-hover:translate-x-0.5 transition-transform"></i>
            <span>Masuk ke Portal</span>
          </NuxtLink>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            aria-label="Toggle Menu"
          >
            <i :class="mobileMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'" class="text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Mobile dropdown -->
      <div v-if="mobileMenuOpen" class="lg:hidden border-b border-white/10 bg-[#0b0f19] px-6 py-4 space-y-3">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          @click="mobileMenuOpen = false"
          class="block py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-indigo-400"
        >
          {{ link.label }}
        </a>
      </div>
    </header>

    <!-- ─────────────── HERO SECTION ─────────────── -->
    <section class="relative pt-36 pb-20 lg:pt-44 lg:pb-32 px-6 lg:px-12 overflow-hidden">
      <!-- Ambient Lighting & Precision Grid -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px]"></div>
        <div class="absolute -top-12 right-10 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[120px]"></div>
        <div
          class="absolute inset-0 opacity-[0.18]"
          style="
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
            background-size: 64px 64px;
          "
        ></div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#070a12]/70 to-[#070a12]"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        <!-- Top Operational Badge -->
        <Motion
          :initial="{ opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4 }"
        >
          <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[11px] font-bold text-indigo-200 tracking-wider uppercase">
              Sistem Operasional HR & Kepegawaian Terintegrasi
            </span>
          </div>
        </Motion>

        <!-- Main Headline -->
        <Motion
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.1 }"
        >
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-0.03em] leading-[1.08] text-white">
            Kelola SDM & Operasional Kerja
            <span class="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-100 to-violet-300">
              Secara Akurat & Otomatis.
            </span>
          </h1>
        </Motion>

        <!-- Subtitle -->
        <Motion
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.2 }"
        >
          <p class="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal">
            Platform komprehensif untuk perusahaan modern: kelola presensi harian, otomatisasi persetujuan cuti berjenjang,
            kalkulasi tunjangan transport berbasis data riil, dan proteksi hak akses terstruktur dalam satu sistem terpadu.
          </p>
        </Motion>

        <!-- CTA Buttons -->
        <Motion
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.3 }"
        >
          <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
            <NuxtLink
              to="/login"
              class="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-black tracking-wide transition-all duration-150 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50"
            >
              <NexusLogo :size="20" />
              <span>Buka Portal Sistem</span>
              <i class="bi bi-arrow-right text-indigo-200"></i>
            </NuxtLink>

            <a
              href="#konsol"
              class="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl border border-white/10 hover:border-indigo-500/40 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white text-sm font-bold tracking-wide transition-all duration-150"
            >
              <i class="bi bi-display text-indigo-400"></i>
              <span>Lihat Antarmuka Modul</span>
            </a>
          </div>
        </Motion>

        <!-- Key Metrics Strip -->
        <Motion
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.6, delay: 0.4 }"
        >
          <div class="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-white/[0.07]">
            <div class="text-center p-3">
              <div class="text-2xl sm:text-3xl font-black text-white tracking-tight">6 Modul</div>
              <div class="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Operasional Terpadu</div>
            </div>
            <div class="text-center p-3">
              <div class="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">100%</div>
              <div class="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Kalkulasi Otomatis</div>
            </div>
            <div class="text-center p-3">
              <div class="text-2xl sm:text-3xl font-black text-indigo-300 tracking-tight">RBAC</div>
              <div class="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Keamanan Berjenjang</div>
            </div>
            <div class="text-center p-3">
              <div class="text-2xl sm:text-3xl font-black text-violet-300 tracking-tight">Real-Time</div>
              <div class="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Sinkronisasi Data</div>
            </div>
          </div>
        </Motion>
      </div>
    </section>

    <!-- ─────────────── INTERACTIVE PRODUCT CONSOLE ─────────────── -->
    <section id="konsol" class="relative py-20 px-6 lg:px-12 bg-[#090d16] border-y border-white/[0.06]">
      <div class="max-w-6xl mx-auto">
        <!-- Section Header -->
        <div class="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            <i class="bi bi-window-dock text-indigo-400"></i>
            <span>Antarmuka Kerja Nyata</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Konsol Operasional NexusHR
          </h2>
          <p class="text-slate-400 text-sm leading-relaxed">
            Klik modul di bawah untuk melihat bagaimana NexusHR menyajikan data kepegawaian, presensi, dan logistik finansial secara terstruktur.
          </p>
        </div>

        <!-- Module Selector Tabs -->
        <div class="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            v-for="tab in consoleTabs"
            :key="tab.id"
            @click="activeConsoleTab = tab.id"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border"
            :class="
              activeConsoleTab === tab.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border-white/[0.06] hover:bg-white/[0.06]'
            "
          >
            <i :class="tab.icon + ' text-sm'"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Product Window Frame -->
        <div class="relative rounded-2xl border border-white/[0.08] bg-[#0c111c] shadow-2xl overflow-hidden">
          <!-- Window Header / Browser Bar -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span class="ml-3 text-[11px] font-mono text-slate-400">portal.nexushr.internal/app/{{ activeConsoleTab }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Database Terhubung
              </span>
            </div>
          </div>

          <!-- Console Dynamic Content -->
          <div class="p-6 sm:p-8 min-h-[440px]">
            <!-- 1. TAB: OVERVIEW / DASHBOARD -->
            <div v-if="activeConsoleTab === 'overview'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 class="text-lg font-black text-white">Ringkasan Eksekutif Kepegawaian</h3>
                  <p class="text-xs text-slate-400">Pemantauan status kehadiran dan produktivitas harian secara langsung</p>
                </div>
                <div class="text-xs font-medium text-slate-400 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                  Status: <span class="text-emerald-400 font-bold">Hari Kerja Berjalan</span>
                </div>
              </div>

              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Karyawan</div>
                  <div class="text-2xl sm:text-3xl font-black text-white mt-1">248</div>
                  <div class="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                    <i class="bi bi-arrow-up-right"></i> +6 bulan ini
                  </div>
                </div>
                <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Hadir Tepat Waktu</div>
                  <div class="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">226</div>
                  <div class="text-[11px] text-emerald-400/80 mt-1 font-medium">91.1% tingkat kehadiran</div>
                </div>
                <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-amber-400">Sedang Cuti / Izin</div>
                  <div class="text-2xl sm:text-3xl font-black text-amber-300 mt-1">14</div>
                  <div class="text-[11px] text-amber-400/80 mt-1 font-medium">Tervalidasi sistem</div>
                </div>
                <div class="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Tunjangan Siap Cair</div>
                  <div class="text-2xl sm:text-3xl font-black text-indigo-300 mt-1">Rp 48.2Jt</div>
                  <div class="text-[11px] text-indigo-400/80 mt-1 font-medium">Periode berjalan</div>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div class="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Distribusi Kehadiran Antar Departemen</span>
                  <span class="text-indigo-400">Rata-rata 94.8%</span>
                </div>
                <div class="space-y-2">
                  <div v-for="dept in depts" :key="dept.name" class="space-y-1">
                    <div class="flex justify-between text-[11px] text-slate-400">
                      <span>{{ dept.name }}</span>
                      <span class="font-mono text-slate-300">{{ dept.rate }}% ({{ dept.count }} orang)</span>
                    </div>
                    <div class="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" :style="{ width: dept.rate + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. TAB: ATTENDANCE -->
            <div v-else-if="activeConsoleTab === 'attendance'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 class="text-lg font-black text-white">Log Presensi & Kehadiran Harian</h3>
                  <p class="text-xs text-slate-400">Pencatatan waktu kerja riil dengan validasi jam masuk dan jam pulang</p>
                </div>
                <div class="flex gap-2">
                  <span class="text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg font-bold">
                    <i class="bi bi-file-earmark-spreadsheet me-1"></i> Ekspor Excel Siap
                  </span>
                </div>
              </div>

              <div class="overflow-x-auto rounded-xl border border-white/[0.06]">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="bg-white/[0.04] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                    <tr>
                      <th class="p-3">Nama Pegawai</th>
                      <th class="p-3">Departemen</th>
                      <th class="p-3">Jam Masuk</th>
                      <th class="p-3">Jam Keluar</th>
                      <th class="p-3">Status</th>
                      <th class="p-3">Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="att in attendanceSample" :key="att.name" class="hover:bg-white/[0.02]">
                      <td class="p-3 font-bold text-white">{{ att.name }}</td>
                      <td class="p-3 text-slate-400">{{ att.dept }}</td>
                      <td class="p-3 font-mono text-slate-200">{{ att.in }}</td>
                      <td class="p-3 font-mono text-slate-200">{{ att.out }}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="att.statusClass">
                          {{ att.status }}
                        </span>
                      </td>
                      <td class="p-3">
                        <span class="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                          <i class="bi bi-check-circle-fill"></i> Tervalidasi
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 3. TAB: LEAVES -->
            <div v-else-if="activeConsoleTab === 'leaves'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 class="text-lg font-black text-white">Alur Pengajuan & Persetujuan Cuti</h3>
                  <p class="text-xs text-slate-400">Manajemen perizinan tanpa kertas dengan pelacakan sisa kuota hak cuti</p>
                </div>
                <div class="text-xs text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                  Total Kuota Standar: <span class="text-white font-bold">12 Hari / Tahun</span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="leave in leaveSample" :key="leave.name" class="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-white">{{ leave.name }}</span>
                    <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider" :class="leave.badgeClass">
                      {{ leave.status }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-400">
                    <div>Jenis: <span class="text-slate-200 font-semibold">{{ leave.type }}</span></div>
                    <div>Periode: <span class="text-slate-200 font-mono">{{ leave.duration }}</span></div>
                    <div>Alasan: <span class="text-slate-300 italic">"{{ leave.reason }}"</span></div>
                  </div>
                  <div class="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span class="text-slate-400">Sisa Jatah: <b class="text-white">{{ leave.remaining }} hari</b></span>
                    <span class="text-indigo-400 font-semibold">{{ leave.approver }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. TAB: TRANSPORT -->
            <div v-else-if="activeConsoleTab === 'transport'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 class="text-lg font-black text-white">Kalkulasi Otomatis Tunjangan Transport</h3>
                  <p class="text-xs text-slate-400">Dihitung otomatis: Formula Jarak Tempuh Rumah-Kantor × Hari Hadir Riil</p>
                </div>
                <div class="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">
                  Bebas Salah Hitung Manual
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div class="lg:col-span-2 overflow-x-auto rounded-xl border border-white/[0.06]">
                  <table class="w-full text-left text-xs text-slate-300">
                    <thead class="bg-white/[0.04] text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                      <tr>
                        <th class="p-3">Karyawan</th>
                        <th class="p-3">Jarak Tempuh</th>
                        <th class="p-3">Hari Hadir</th>
                        <th class="p-3">Tarif / Hari</th>
                        <th class="p-3">Total Tunjangan</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/[0.04]">
                      <tr v-for="tr in transportSample" :key="tr.name" class="hover:bg-white/[0.02]">
                        <td class="p-3 font-bold text-white">{{ tr.name }}</td>
                        <td class="p-3 font-mono text-indigo-300">{{ tr.distance }}</td>
                        <td class="p-3 font-mono text-emerald-300">{{ tr.days }} hari</td>
                        <td class="p-3 font-mono text-slate-300">{{ tr.rate }}</td>
                        <td class="p-3 font-mono font-bold text-white">{{ tr.total }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col justify-between space-y-4">
                  <div>
                    <div class="text-[10px] font-black uppercase tracking-widest text-indigo-400">Mekanisme Rekonsiliasi</div>
                    <h4 class="text-base font-bold text-white mt-1">Otomatisasi Tanpa Spreadsheet</h4>
                    <p class="text-xs text-slate-300 mt-2 leading-relaxed">
                      Sistem mencocokkan setiap rekaman absensi sah di database dengan radius koordinat jarak tempat tinggal. 
                      Di akhir bulan, rekapitulasi nominal tunjangan selesai dalam hitungan detik.
                    </p>
                  </div>
                  <div class="pt-3 border-t border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between font-bold">
                    <span>Akurasi Pembayaran</span>
                    <span>100% Sesuai Presensi</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. TAB: EMPLOYEES -->
            <div v-else-if="activeConsoleTab === 'employees'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 class="text-lg font-black text-white">Direktori & Profil Terpadu Karyawan</h3>
                  <p class="text-xs text-slate-400">Master data pegawai lengkap dengan riwayat kontrak, jabatan, dan dokumen</p>
                </div>
                <div class="text-xs text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                  Format Baku Perusahaan
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="emp in employeeSample" :key="emp.nip" class="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                      {{ emp.initials }}
                    </div>
                    <div>
                      <div class="text-xs font-black text-white">{{ emp.name }}</div>
                      <div class="text-[11px] text-slate-400">{{ emp.role }}</div>
                    </div>
                  </div>
                  <div class="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-white/[0.06]">
                    <div class="flex justify-between">
                      <span>NIP:</span>
                      <span class="font-mono text-slate-300">{{ emp.nip }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Departemen:</span>
                      <span class="text-slate-300">{{ emp.dept }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Status Kerja:</span>
                      <span class="text-emerald-400 font-semibold">{{ emp.status }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 6. TAB: SECURITY / RBAC -->
            <div v-else-if="activeConsoleTab === 'security'" class="space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <h3 class="text-lg font-black text-white">Matriks Hak Akses Berjenjang (RBAC)</h3>
                  <p class="text-xs text-slate-400">Pemisahan wewenang operasional ketat untuk menjamin privasi dan kepatuhan</p>
                </div>
                <div class="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">
                  <i class="bi bi-shield-lock-fill me-1"></i> Terisolasi Penuh
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div v-for="role in roleSample" :key="role.name" class="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div class="text-xs font-black" :class="role.color">{{ role.name }}</div>
                  <div class="text-[11px] text-slate-400 leading-snug">{{ role.scope }}</div>
                  <div class="pt-2 border-t border-white/[0.06] space-y-1">
                    <div v-for="perm in role.perms" :key="perm" class="text-[10px] text-slate-300 flex items-center gap-1.5">
                      <i class="bi bi-check2 text-emerald-400"></i>
                      <span>{{ perm }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────── BENTO GRID: MODUL UTAMA ─────────────── -->
    <section id="modul" class="relative py-28 px-6 lg:px-12">
      <div class="max-w-6xl mx-auto space-y-16">
        <!-- Section Header -->
        <div class="max-w-2xl space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">
            <span>Kapabilitas Inti</span>
          </div>
          <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Modul Operasional Lengkap.
          </h2>
          <p class="text-slate-400 text-sm sm:text-base leading-relaxed">
            Dirancang khusus untuk menjawab tantangan tata kelola SDM di lapangan: tanpa kerumitan administrasi manual, 
            tanpa lembar kerja tercecer, dan transparan bagi manajemen maupun karyawan.
          </p>
        </div>

        <!-- Asymmetrical Bento Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Bento 1 (Hero Bento: 2 cols): Tunjangan Transport -->
          <div class="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-white/[0.03] to-white/[0.02] border border-indigo-500/25 relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300">
            <div class="space-y-4 relative z-10">
              <div class="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xl">
                <i class="bi bi-cash-coin"></i>
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Modul Unggulan</span>
                <h3 class="text-2xl font-black text-white mt-1">Otomatisasi Tunjangan Transport & Kompensasi</h3>
                <p class="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                  Tidak ada lagi kalkulasi manual berjam-jam setiap tanggal tutup buku. NexusHR secara otomatis menghitung 
                  tunjangan harian berbasis verifikasi jarak alamat tempat tinggal ke kantor dan rekapitulasi presensi sah.
                </p>
              </div>

              <!-- Interactive Calculation Visualizer -->
              <div class="p-4 rounded-xl bg-[#080c14]/90 border border-white/[0.08] max-w-lg space-y-2 font-mono text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Rumus Komputasi:</span>
                  <span class="text-indigo-300">Presensi Sah × Tarif Zona Jarak</span>
                </div>
                <div class="p-2.5 rounded bg-white/[0.04] text-slate-200 flex justify-between items-center text-[11px]">
                  <span>22 Hari Hadir × Rp 45.000 (Zona B)</span>
                  <span class="text-emerald-400 font-bold">= Rp 990.000 / Pegawai</span>
                </div>
              </div>
            </div>

            <div class="pt-6 relative z-10 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span class="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">Bebas Human-Error</span>
              <span class="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">Audit Terverifikasi</span>
              <span class="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">Ekspor Siap Payroll</span>
            </div>
          </div>

          <!-- Bento 2 (1 col): Presensi Real-Time -->
          <div class="p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                <i class="bi bi-calendar-check-fill"></i>
              </div>
              <h3 class="text-xl font-black text-white">Presensi Presisi Harian</h3>
              <p class="text-slate-400 text-xs leading-relaxed">
                Pencatatan jam kerja secara langsung dengan validasi status hadir, telat, izin, dan lembur secara objektif.
              </p>
            </div>
            <div class="pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Rekapitulasi Harian</span>
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>

          <!-- Bento 3 (1 col): Alur Persetujuan Cuti -->
          <div class="p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl">
                <i class="bi bi-calendar2-range-fill"></i>
              </div>
              <h3 class="text-xl font-black text-white">Manajemen Cuti Paperless</h3>
              <p class="text-slate-400 text-xs leading-relaxed">
                Pengajuan cuti tahunan, sakit, dan izin khusus dengan verifikasi persetujuan atasan langsung secara transparan.
              </p>
            </div>
            <div class="pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-amber-400 font-bold">
              <span>Notifikasi Multi-Jenjang</span>
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>

          <!-- Bento 4 (2 cols): Keamanan & RBAC -->
          <div class="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-violet-950/30 via-white/[0.03] to-white/[0.02] border border-violet-500/20 relative overflow-hidden flex flex-col justify-between group hover:border-violet-500/35 transition-all duration-300">
            <div class="space-y-4 relative z-10">
              <div class="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xl">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-violet-400">Tata Kelola & Keamanan</span>
                <h3 class="text-2xl font-black text-white mt-1">Kontrol Akses Berjenjang (RBAC) & Proteksi Data</h3>
                <p class="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                  Batasi akses data sensitif kepegawaian sesuai wewenang. Super Admin, HR Manager, Divisi Lead, dan Karyawan 
                  memiliki tampilan dan izin aksi yang terisolasi secara aman.
                </p>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div class="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">Super Admin</div>
                  <div class="text-xs font-semibold text-white mt-0.5">Akses Sistem Total</div>
                </div>
                <div class="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">HR Admin</div>
                  <div class="text-xs font-semibold text-white mt-0.5">Kelola Pegawai & Cuti</div>
                </div>
                <div class="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">Karyawan</div>
                  <div class="text-xs font-semibold text-white mt-0.5">Self-Service Portal</div>
                </div>
              </div>
            </div>

            <div class="pt-6 relative z-10 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span class="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">Audit Log Lengkap</span>
              <span class="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">JWT Session Enforced</span>
            </div>
          </div>

          <!-- Bento 5 (1 col): Ekspor Laporan -->
          <div class="p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-sky-500/30 transition-all duration-300 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xl">
                <i class="bi bi-file-earmark-bar-graph-fill"></i>
              </div>
              <h3 class="text-xl font-black text-white">Ekspor Laporan Cepat</h3>
              <p class="text-slate-400 text-xs leading-relaxed">
                Unduh rekapitulasi presensi bulanan dan rincian tunjangan dalam format Excel (.xlsx) dan PDF resmi satu klik.
              </p>
            </div>
            <div class="pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-sky-400 font-bold">
              <span>Excel & PDF Native</span>
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────── ALUR KERJA OPERASIONAL ─────────────── -->
    <section id="alur-kerja" class="relative py-28 px-6 lg:px-12 bg-[#080c14] border-y border-white/[0.06]">
      <div class="max-w-6xl mx-auto space-y-16">
        <div class="text-center max-w-2xl mx-auto space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            <i class="bi bi-diagram-3 text-indigo-400"></i>
            <span>Alur Sistem Terintegrasi</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Bagaimana NexusHR Bekerja Sehari-hari
          </h2>
          <p class="text-slate-400 text-sm leading-relaxed">
            Dari absensi pagi hingga pembukuan di akhir bulan, seluruh aktivitas mengalir dalam satu pipeline terotomatisasi.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(step, idx) in workflowSteps"
            :key="step.title"
            class="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 relative"
          >
            <div class="flex items-center justify-between">
              <span class="text-2xl font-black text-indigo-400/40 font-mono">0{{ idx + 1 }}</span>
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-sm">
                <i :class="step.icon"></i>
              </div>
            </div>
            <h3 class="text-base font-black text-white">{{ step.title }}</h3>
            <p class="text-xs text-slate-400 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────── KEANDALAN & KEAMANAN ─────────────── -->
    <section id="keamanan" class="relative py-28 px-6 lg:px-12">
      <div class="max-w-6xl mx-auto">
        <div class="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#0e1424] to-[#0a0e1a] border border-white/[0.08] relative overflow-hidden space-y-10">
          <div class="max-w-2xl space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <i class="bi bi-shield-fill-check"></i> Standar Operasional Enterprise
            </div>
            <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Keandalan Tinggi untuk Kebutuhan Korporasi.
            </h2>
            <p class="text-slate-400 text-sm leading-relaxed">
              Arsitektur sistem dibangun dengan integritas basis data tinggi, perlindungan autentikasi berbasis sesi terenkripsi, 
              serta pemisahan wewenang yang siap diaudit kapan pun.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div class="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <i class="bi bi-database-lock text-2xl text-indigo-400"></i>
              <h3 class="text-sm font-bold text-white">Integritas Relasional</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Penyimpanan data terstruktur dengan validasi skema ketat untuk mencegah anomali catatan presensi dan gaji.
              </p>
            </div>
            <div class="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <i class="bi bi-key-fill text-2xl text-emerald-400"></i>
              <h3 class="text-sm font-bold text-white">Sesi Aman Terenkripsi</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Perlindungan token JWT berlapis dengan masa kedaluwarsa otomatis dan enkripsi kata sandi standar industri.
              </p>
            </div>
            <div class="space-y-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <i class="bi bi-journal-check text-2xl text-violet-400"></i>
              <h3 class="text-sm font-bold text-white">Jejak Audit Tanpa Celah</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Setiap persetujuan cuti, pengubahan status pegawai, dan kalkulasi tunjangan tercatat lengkap dengan stempel waktu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────── CALL TO ACTION ─────────────── -->
    <section class="relative py-24 px-6 lg:px-12 bg-gradient-to-b from-[#070a12] via-[#090e1c] to-[#070a12] border-t border-white/[0.06] text-center">
      <div class="max-w-3xl mx-auto space-y-8">
        <div class="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl mx-auto">
          <NexusLogo :size="32" />
        </div>

        <div class="space-y-3">
          <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Siap Mengoptimalkan Operasional SDM Anda?
          </h2>
          <p class="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Masuk ke portal NexusHR untuk mulai mengelola kehadiran, perizinan cuti, dan tunjangan pegawai Anda sekarang juga.
          </p>
        </div>

        <div class="pt-2">
          <NuxtLink
            to="/login"
            class="inline-flex items-center gap-3 px-9 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-black tracking-wider uppercase transition-all duration-150 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50"
          >
            <span>Buka Portal NexusHR</span>
            <i class="bi bi-arrow-right"></i>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ─────────────── FOOTER ─────────────── -->
    <footer class="relative py-12 px-6 lg:px-12 border-t border-white/[0.06] bg-[#05070d]">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <NexusLogo :size="28" />
          <div>
            <div class="text-sm font-black text-white">NexusHR</div>
            <div class="text-[10px] text-slate-400">Enterprise Human Resource & Operations Management</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#konsol" class="hover:text-white transition-colors">Antarmuka</a>
          <a href="#modul" class="hover:text-white transition-colors">Modul Sistem</a>
          <a href="#alur-kerja" class="hover:text-white transition-colors">Alur Kerja</a>
          <a href="#keamanan" class="hover:text-white transition-colors">Keamanan</a>
          <NuxtLink to="/login" class="text-indigo-400 hover:text-indigo-300 transition-colors">Portal Login</NuxtLink>
        </div>

        <div class="flex items-center gap-2 text-[11px] text-slate-400">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Sistem Beroperasi Normal</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

definePageMeta({ layout: false });

useHead({
  title: "NexusHR — Sistem Manajemen SDM & Operasional Perusahaan",
  meta: [
    {
      name: "description",
      content:
        "Sistem informasi manajemen SDM dan operasional terpadu: presensi real-time, manajemen cuti terintegrasi, kalkulasi tunjangan transport otomatis, dan kontrol akses berjenjang (RBAC).",
    },
  ],
});

const mobileMenuOpen = ref(false);

const navLinks = [
  { label: "Antarmuka", href: "#konsol" },
  { label: "Modul Utama", href: "#modul" },
  { label: "Alur Kerja", href: "#alur-kerja" },
  { label: "Keamanan", href: "#keamanan" },
];

// Interactive Console Tabs
const activeConsoleTab = ref("overview");

const consoleTabs = [
  { id: "overview", label: "Ringkasan Eksekutif", icon: "bi bi-grid-1x2-fill" },
  { id: "attendance", label: "Presensi & Kehadiran", icon: "bi bi-calendar-check-fill" },
  { id: "leaves", label: "Pengajuan Cuti", icon: "bi bi-calendar2-range-fill" },
  { id: "transport", label: "Tunjangan Transport", icon: "bi bi-cash-stack" },
  { id: "employees", label: "Direktori Karyawan", icon: "bi bi-people-fill" },
  { id: "security", label: "Kontrol Akses (RBAC)", icon: "bi bi-shield-lock-fill" },
];

// Department Distribution Data
const depts = [
  { name: "Engineering & Tech", rate: 96, count: 68 },
  { name: "Product & Operations", rate: 94, count: 52 },
  { name: "Finance & Accounting", rate: 98, count: 24 },
  { name: "People Operations (HR)", rate: 100, count: 18 },
  { name: "Sales & Client Growth", rate: 91, count: 86 },
];

// Attendance Sample Data
const attendanceSample = [
  { name: "Dimas Aditya", dept: "Engineering", in: "08:14 WIB", out: "17:05 WIB", status: "Tepat Waktu", statusClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  { name: "Siti Rahmania", dept: "Finance", in: "08:25 WIB", out: "17:15 WIB", status: "Tepat Waktu", statusClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  { name: "Budi Santoso", dept: "Operations", in: "08:47 WIB", out: "17:30 WIB", status: "Telat (17m)", statusClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  { name: "Anisa Wardani", dept: "People Ops", in: "08:05 WIB", out: "17:02 WIB", status: "Tepat Waktu", statusClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  { name: "Fajar Pratama", dept: "Product", in: "08:20 WIB", out: "17:10 WIB", status: "Tepat Waktu", statusClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
];

// Leave Sample Data
const leaveSample = [
  { name: "Rizky Firmansyah", type: "Cuti Tahunan", duration: "24 - 26 Sep (3 Hari)", reason: "Keperluan keluarga di luar kota", status: "Disetujui", badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", remaining: 8, approver: "Manager: Dian P." },
  { name: "Maya Kusuma", type: "Izin Sakit", duration: "19 Sep (1 Hari)", reason: "Flu & Istirahat Dokter", status: "Tervalidasi", badgeClass: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20", remaining: 11, approver: "HR: Anisa W." },
  { name: "Hendro Wijaya", type: "Cuti Menikah", duration: "01 - 03 Okt (3 Hari)", reason: "Pernikahan Saudara Kandung", status: "Menunggu", badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20", remaining: 10, approver: "Menunggu Lead" },
];

// Transport Sample Data
const transportSample = [
  { name: "Bambang Pamungkas", distance: "18.4 km", days: 22, rate: "Rp 45.000", total: "Rp 990.000" },
  { name: "Clara Sinta", distance: "8.2 km", days: 21, rate: "Rp 30.000", total: "Rp 630.000" },
  { name: "Deni Saputra", distance: "26.5 km", days: 23, rate: "Rp 60.000", total: "Rp 1.380.000" },
  { name: "Eko Prasetyo", distance: "12.0 km", days: 20, rate: "Rp 35.000", total: "Rp 700.000" },
];

// Employee Sample Data
const employeeSample = [
  { name: "Ahmad Fauzi", initials: "AF", role: "Senior Software Engineer", nip: "EMP-2024-041", dept: "Engineering", status: "Karyawan Tetap" },
  { name: "Nadia Putri", initials: "NP", role: "People Operations Specialist", nip: "EMP-2024-018", dept: "Human Resource", status: "Karyawan Tetap" },
  { name: "Reza Gunawan", initials: "RG", role: "Financial Planning Analyst", nip: "EMP-2024-062", dept: "Finance & Tax", status: "Karyawan Tetap" },
];

// Role Matrix Sample Data
const roleSample = [
  { name: "Super Admin", color: "text-rose-400", scope: "Pengaturan sistem penuh & manajemen peran pengguna", perms: ["Kelola Pengguna", "Konfigurasi Sistem", "Akses Seluruh Log"] },
  { name: "HR Manager", color: "text-indigo-400", scope: "Pengelolaan direktori karyawan & persetujuan izin", perms: ["Master Pegawai", "Persetujuan Cuti", "Rekapitulasi Presensi"] },
  { name: "Finance Lead", color: "text-emerald-400", scope: "Validasi & ekspor tunjangan transport bulanan", perms: ["Kalkulasi Tunjangan", "Ekspor ke Payroll", "Audit Kehadiran"] },
  { name: "Karyawan", color: "text-slate-300", scope: "Akses data mandiri & pengajuan izin/cuti harian", perms: ["Presensi Harian", "Pengajuan Cuti", "Cek Sisa Jatah"] },
];

// Workflow Steps
const workflowSteps = [
  {
    title: "Presensi Harian Sah",
    desc: "Karyawan melakukan pencatatan kehadiran setiap hari kerja dengan validasi waktu masuk & pulang akurat.",
    icon: "bi bi-fingerprint",
  },
  {
    title: "Pengajuan & Verifikasi",
    desc: "Pengajuan cuti, izin, atau sakit diproses secara paperless dengan notifikasi persetujuan langsung dari atasan.",
    icon: "bi bi-check2-square",
  },
  {
    title: "Komputasi Tunjangan",
    desc: "Sistem mengalikan hari hadir efektif dengan jarak tempat tinggal tanpa butuh penghitungan manual di Excel.",
    icon: "bi bi-calculator",
  },
  {
    title: "Ekspor & Rekapitulasi",
    desc: "Laporan bulanan dapat diunduh dalam format Excel atau PDF siap saji untuk kebutuhan penggajian dan audit.",
    icon: "bi bi-file-earmark-arrow-down",
  },
];
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap");

.landing-root {
  font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  scroll-behavior: smooth;
}
</style>
