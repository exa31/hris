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

const { user, loading } = useAuth();

// Dummy data
const dummyUser = {
  id: 1,
  employee_id: 1,
  username: 'manager_hrd',
  role_id: 2,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  employee: {
    id: 1,
    nip: 123456789,
    name: 'Budi Santoso',
    email: 'budi@company.com',
    phone: '08123456789',
    birth_date: '1990-05-15',
    address_id: 1,
    marital_status: 'Married' as any,
    gender: 'Male' as any,
    children_count: 2,
    join_date: '2020-01-01',
    position: 'Manager' as any,
    department: 'HRD' as any,
    type: 'Tetap' as any,
    status: true,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  role: {
    id: 2,
    name: 'Manager HRD',
  },
};

const dummyStats = {
  total: 45,
  kontrak: 12,
  tetap: 25,
  magang: 8,
  male: 28,
  female: 17,
};

const dummyNewEmployees: Employee[] = [
  {
    id: 1,
    nip: 111111111,
    name: 'Ari Wijaya',
    email: 'ari@company.com',
    phone: '08111111111',
    birth_date: '1995-08-20',
    address_id: 1,
    marital_status: 'Single' as any,
    gender: 'Male' as any,
    children_count: 0,
    join_date: '2024-03-15',
    position: 'Staf' as any,
    department: 'HRD' as any,
    type: 'Kontrak' as any,
    status: true,
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 2,
    nip: 222222222,
    name: 'Siti Nursyamsi',
    email: 'siti@company.com',
    phone: '08222222222',
    birth_date: '1998-03-10',
    address_id: 2,
    marital_status: 'Single' as any,
    gender: 'Female' as any,
    children_count: 0,
    join_date: '2024-03-01',
    position: 'Staf' as any,
    department: 'HRD' as any,
    type: 'Kontrak' as any,
    status: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 3,
    nip: 333333333,
    name: 'Rinto Harahap',
    email: 'rinto@company.com',
    phone: '08333333333',
    birth_date: '1996-11-05',
    address_id: 3,
    marital_status: 'Married' as any,
    gender: 'Male' as any,
    children_count: 1,
    join_date: '2024-02-20',
    position: 'Staf' as any,
    department: 'Marketing' as any,
    type: 'Kontrak' as any,
    status: true,
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z',
  },
  {
    id: 4,
    nip: 444444444,
    name: 'Dewi Lestari',
    email: 'dewi@company.com',
    phone: '08444444444',
    birth_date: '1997-07-12',
    address_id: 4,
    marital_status: 'Single' as any,
    gender: 'Female' as any,
    children_count: 0,
    join_date: '2024-02-10',
    position: 'Staf' as any,
    department: 'Production' as any,
    type: 'Kontrak' as any,
    status: true,
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z',
  },
  {
    id: 5,
    nip: 555555555,
    name: 'Hendra Gunawan',
    email: 'hendra@company.com',
    phone: '08555555555',
    birth_date: '1994-09-25',
    address_id: 5,
    marital_status: 'Married' as any,
    gender: 'Male' as any,
    children_count: 2,
    join_date: '2024-01-15',
    position: 'Staf' as any,
    department: 'Production' as any,
    type: 'Kontrak' as any,
    status: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

// Component state
const stats = ref(dummyStats);
const newEmployees = ref(dummyNewEmployees);
const currentUser = computed(() => dummyUser);

// Format date helper
const formatDate = (dateStr: string) => {
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
