<template>
  <div class="dashboard-container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else>
      <!-- Superadmin Dashboard -->
      <div v-if="currentUser?.role?.name === 'Superadmin'" class="welcome-section">
        <div class="card shadow">
          <div class="card-body py-5">
            <h1 class="text-center">
              Selamat Datang {{ currentUser?.employee?.name }} - {{ currentUser?.role?.name }}
            </h1>
          </div>
        </div>
      </div>

      <!-- Admin HRD Dashboard -->
      <div v-else-if="currentUser?.role?.name === 'Admin HRD'" class="welcome-section">
        <div class="card shadow">
          <div class="card-body py-5">
            <h1 class="text-center">
              Selamat Datang {{ currentUser?.employee?.name }} - {{ currentUser?.role?.name }}
            </h1>
          </div>
        </div>
      </div>

      <!-- Manager HRD Dashboard -->
      <div v-else-if="currentUser?.role?.name === 'Manager HRD'" class="manager-dashboard">
        <div class="mb-4">
          <h1 class="mb-4">Dashboard - {{ currentUser?.employee?.name }}</h1>
        </div>

        <!-- Widgets Section -->
        <div class="row mb-4">
          <div class="col-md-6 col-lg-3 mb-3">
            <div class="card shadow-sm stats-card">
              <div class="card-body">
                <h6 class="card-title text-muted">Total Pegawai</h6>
                <h2 class="card-text">{{ stats?.total || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3 mb-3">
            <div class="card shadow-sm stats-card">
              <div class="card-body">
                <h6 class="card-title text-muted">Pegawai Kontrak</h6>
                <h2 class="card-text">{{ stats?.kontrak || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3 mb-3">
            <div class="card shadow-sm stats-card">
              <div class="card-body">
                <h6 class="card-title text-muted">Pegawai Tetap</h6>
                <h2 class="card-text">{{ stats?.tetap || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3 mb-3">
            <div class="card shadow-sm stats-card">
              <div class="card-body">
                <h6 class="card-title text-muted">Peserta Magang</h6>
                <h2 class="card-text">{{ stats?.magang || 0 }}</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row mb-4">
          <div class="col-md-6 mb-3">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title mb-3">Tipe Pegawai (Kontrak, Tetap, Magang)</h5>
                <DoughnutChart 
                  v-if="stats"
                  :kontrak="stats.kontrak"
                  :tetap="stats.tetap"
                  :magang="stats.magang"
                />
              </div>
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title mb-3">Jenis Kelamin Pegawai (Pria, Wanita)</h5>
                <GenderChart 
                  v-if="stats"
                  :male="stats.male"
                  :female="stats.female"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- New Employees Table Section -->
        <div class="row">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title mb-3">5 Pegawai Kontrak Terbaru</h5>
                <div class="table-responsive">
                  <table class="table table-sm table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>No.</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Tanggal Masuk</th>
                        <th>Tipe</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(employee, idx) in newEmployees" :key="employee.id">
                        <td>{{ idx + 1 }}</td>
                        <td>{{ employee.name }}</td>
                        <td>{{ employee.email }}</td>
                        <td>{{ formatDate(employee.join_date) }}</td>
                        <td>
                          <span class="badge bg-info">{{ employee.type }}</span>
                        </td>
                      </tr>
                      <tr v-if="!newEmployees || newEmployees.length === 0">
                        <td colspan="5" class="text-center text-muted">Tidak ada data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Default message for unknown roles -->
      <div v-else class="alert alert-warning">
        Dashboard untuk role {{ currentUser?.role?.name }} belum tersedia
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { User, Employee } from '~/types/models';
import DoughnutChart from '~/components/dashboard/DoughnutChart.vue';
import GenderChart from '~/components/dashboard/GenderChart.vue';

definePageMeta({
  layout: 'default', // Use default layout with sidebar
});

// Auth and Loading state
const { user: currentUser, loading: authLoading } = useAuth();
const loading = ref(false);

interface DashboardStats {
  total: number;
  kontrak: number;
  tetap: number;
  magang: number;
  male: number;
  female: number;
}

// Component state
const stats = ref<DashboardStats | null>(null);
const newEmployees = ref<Employee[]>([]);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>('/api/dashboard/stats');
    const data = res.data;
    stats.value = data.stats;
    newEmployees.value = data.latestEmployees;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});

// Format date helper
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem 1rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.welcome-section h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
}

.manager-dashboard {
  padding: 0;
}

.stats-card {
  border: none;
  border-left: 4px solid #667eea;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

.stats-card .card-body {
  padding: 1.5rem;
}

.stats-card h2 {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.table-responsive {
  border-radius: 0.25rem;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}
</style>
