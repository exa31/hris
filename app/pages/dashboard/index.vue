<template>
  <div class="dashboard-container">
    <div v-if="authLoading || loading" class="loading-state">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">Memuat dashboard...</p>
    </div>

    <div v-else>
      <!-- ===== SUPER ADMIN & ADMIN HRD: Welcome Only ===== -->
      <div
        v-if="currentUser?.role?.name === 'Super Admin' || currentUser?.role?.name === 'Admin HRD'"
        class="welcome-wrapper"
      >
        <div class="welcome-card">
          <div class="welcome-icon">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="welcome-badge">{{ currentUser?.role?.name }}</div>
          <h1 class="welcome-title">
            Selamat Datang, <span class="gradient-text">{{ currentUser?.employee?.name }}</span>
          </h1>
          <p class="welcome-subtitle">
            Anda masuk sebagai <strong>{{ currentUser?.role?.name }}</strong>.
            Gunakan menu di sebelah kiri untuk mulai bekerja.
          </p>
        </div>
      </div>

      <!-- ===== MANAGER HRD: Full Dashboard ===== -->
      <div v-else-if="currentUser?.role?.name === 'Manager HRD'" class="manager-dashboard">

        <!-- Page Header -->
        <div class="dash-header mb-4">
          <div>
            <h1 class="dash-title">Dashboard</h1>
            <p class="dash-subtitle">Selamat datang kembali, <strong>{{ currentUser?.employee?.name }}</strong> 👋</p>
          </div>
          <div class="dash-date">
            <i class="bi bi-calendar3 me-2"></i>
            {{ todayFormatted }}
          </div>
        </div>

        <!-- Stat Widgets -->
        <div class="row g-4 mb-4">
          <div class="col-sm-6 col-xl-3">
            <div class="stat-card stat-card--blue">
              <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
              <div class="stat-body">
                <div class="stat-label">Total Pegawai</div>
                <div class="stat-value">{{ stats?.total ?? '—' }}</div>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-xl-3">
            <div class="stat-card stat-card--orange">
              <div class="stat-icon"><i class="bi bi-file-earmark-text-fill"></i></div>
              <div class="stat-body">
                <div class="stat-label">Pegawai Kontrak</div>
                <div class="stat-value">{{ stats?.kontrak ?? '—' }}</div>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-xl-3">
            <div class="stat-card stat-card--green">
              <div class="stat-icon"><i class="bi bi-person-check-fill"></i></div>
              <div class="stat-body">
                <div class="stat-label">Pegawai Tetap</div>
                <div class="stat-value">{{ stats?.tetap ?? '—' }}</div>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-xl-3">
            <div class="stat-card stat-card--purple">
              <div class="stat-icon"><i class="bi bi-mortarboard-fill"></i></div>
              <div class="stat-body">
                <div class="stat-label">Peserta Magang</div>
                <div class="stat-value">{{ stats?.magang ?? '—' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="row g-4 mb-4">
          <div class="col-lg-6">
            <div class="chart-card">
              <div class="chart-card__header">
                <h5><i class="bi bi-pie-chart-fill me-2 text-primary"></i>Tipe Pegawai</h5>
                <span class="chart-period">Aktif</span>
              </div>
              <div class="chart-card__body">
                <DoughnutChart
                  v-if="stats"
                  :kontrak="stats.kontrak"
                  :tetap="stats.tetap"
                  :magang="stats.magang"
                />
                <div v-else class="chart-placeholder"><i class="bi bi-bar-chart-line"></i></div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="chart-card">
              <div class="chart-card__header">
                <h5><i class="bi bi-gender-ambiguous me-2 text-success"></i>Jenis Kelamin</h5>
                <span class="chart-period">Aktif</span>
              </div>
              <div class="chart-card__body">
                <GenderChart
                  v-if="stats"
                  :male="stats.male"
                  :female="stats.female"
                />
                <div v-else class="chart-placeholder"><i class="bi bi-bar-chart-line"></i></div>
              </div>
            </div>
          </div>
        </div>

        <!-- New Contract Employees Table -->
        <div class="row g-4">
          <div class="col-12">
            <div class="table-card">
              <div class="table-card__header">
                <div>
                  <h5><i class="bi bi-clock-history me-2 text-warning"></i>5 Pegawai Kontrak Terbaru</h5>
                  <p class="table-card__subtitle">Berdasarkan tanggal masuk terbaru</p>
                </div>
                <NuxtLink to="/employees" class="btn btn-sm btn-outline-primary">
                  Lihat Semua <i class="bi bi-arrow-right ms-1"></i>
                </NuxtLink>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Foto</th>
                      <th>Nama</th>
                      <th>Jabatan</th>
                      <th>Departemen</th>
                      <th>Tgl Masuk</th>
                      <th>Tipe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(emp, idx) in newEmployees" :key="emp.id">
                      <td class="text-muted">{{ idx + 1 }}</td>
                      <td>
                        <img
                          :src="emp.photo_url || 'https://ui-avatars.com/api/?name=' + emp.name + '&background=random&size=40'"
                          class="rounded-circle border"
                          style="width:38px;height:38px;object-fit:cover;"
                          alt="avatar"
                        />
                      </td>
                      <td class="fw-semibold">{{ emp.name }}</td>
                      <td>{{ emp.position }}</td>
                      <td>{{ emp.department }}</td>
                      <td>{{ formatDate(emp.join_date) }}</td>
                      <td><span class="badge badge-kontrak">{{ emp.type }}</span></td>
                    </tr>
                    <tr v-if="!newEmployees.length">
                      <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox d-block fs-2 mb-2"></i>Tidak ada data
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== FALLBACK (WELCOME CARD) ===== -->
      <div v-else class="welcome-wrapper">
        <div class="welcome-card">
          <div class="welcome-icon">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="welcome-badge">{{ currentUser?.role?.name }}</div>
          <h1 class="welcome-title">
            Selamat Datang, <span class="gradient-text">{{ currentUser?.employee?.name }}</span>
          </h1>
          <p class="welcome-subtitle">
            Anda masuk sebagai <strong>{{ currentUser?.role?.name }}</strong>.
            Gunakan menu di sebelah kiri untuk mulai bekerja.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DoughnutChart from '~/components/dashboard/DoughnutChart.vue';
import GenderChart from '~/components/dashboard/GenderChart.vue';

definePageMeta({ layout: 'default' });

const { user: currentUser, loading: authLoading, hasPermission } = useAuth();
const loading = ref(false);

interface DashboardStats {
  total: number;
  kontrak: number;
  tetap: number;
  magang: number;
  male: number;
  female: number;
}

const stats = ref<DashboardStats | null>(null);
const newEmployees = ref<any[]>([]);

const todayFormatted = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>('/api/dashboard/stats');
    stats.value = res.data.stats;
    newEmployees.value = res.data.latestEmployees;
  } catch (e) {
    console.error('Failed to fetch dashboard data:', e);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Re-fetch data whenever user becomes available or changes to Manager HRD
watch(() => currentUser.value, (newUser) => {
  if (newUser?.role?.name === 'Manager HRD') {
    fetchDashboardData();
  }
}, { immediate: true });

onMounted(() => {
  if (currentUser.value?.role?.name === 'Manager HRD') {
    fetchDashboardData();
  }
});
</script>

<style scoped>
/* ─── Layout ─── */
.dashboard-container { padding: 2rem 1rem; min-height: 100vh; }

.loading-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 50vh; gap: 0.5rem;
}

/* ─── Welcome Card ─── */
.welcome-wrapper {
  display: flex; align-items: center; justify-content: center;
  min-height: 60vh;
}

.welcome-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border: 1px solid #e8ecff;
  border-radius: 1.5rem;
  padding: 3.5rem 3rem;
  text-align: center;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(102, 126, 234, 0.12);
}

.welcome-icon { font-size: 4rem; color: #667eea; margin-bottom: 1rem; }

.welcome-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #7c8ef4);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 1rem;
  border-radius: 2rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
}

.welcome-title { font-size: 1.9rem; font-weight: 700; color: #1e293b; margin-bottom: 0.75rem; }
.welcome-subtitle { color: #64748b; font-size: 1rem; line-height: 1.6; margin: 0; }
.gradient-text {
  background: linear-gradient(135deg, #667eea, #7c8ef4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ─── Manager Dashboard Header ─── */
.dash-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.dash-title { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; }
.dash-subtitle { color: #64748b; margin: 0.25rem 0 0; font-size: 0.95rem; }
.dash-date {
  color: #667eea;
  font-size: 0.85rem;
  font-weight: 500;
  background: #f0f3ff;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  border: 1px solid #dde3ff;
  white-space: nowrap;
}

/* ─── Stat Cards ─── */
.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 1rem;
  border: none;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  background: #fff;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 56px; height: 56px;
  border-radius: 0.875rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-card--blue .stat-icon  { background: #eff3ff; color: #667eea; }
.stat-card--orange .stat-icon { background: #fff4ec; color: #f97316; }
.stat-card--green .stat-icon  { background: #ecfdf5; color: #10b981; }
.stat-card--purple .stat-icon { background: #f5f3ff; color: #8b5cf6; }

.stat-card--blue  { border-left: 4px solid #667eea; }
.stat-card--orange{ border-left: 4px solid #f97316; }
.stat-card--green { border-left: 4px solid #10b981; }
.stat-card--purple{ border-left: 4px solid #8b5cf6; }

.stat-label { font-size: 0.8rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 2rem; font-weight: 700; color: #1e293b; line-height: 1.2; }

/* ─── Chart Cards ─── */
.chart-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  height: 100%;
}

.chart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.chart-card__header h5 { margin: 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
.chart-period {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
}
.chart-card__body { padding: 1.5rem; }
.chart-placeholder { text-align: center; font-size: 3rem; color: #e2e8f0; padding: 2rem 0; }

/* ─── Table Card ─── */
.table-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}

.table-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.table-card__header h5 { margin: 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
.table-card__subtitle { font-size: 0.8rem; color: #94a3b8; margin: 0.2rem 0 0; }

.table thead th {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.9rem 1rem;
}

.table tbody td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.9rem;
}

.badge-kontrak {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-weight: 500;
}
</style>
