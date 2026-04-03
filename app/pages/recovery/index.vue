<template>
  <div class="recovery-page p-4">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="h3 fw-bold mb-1">
            <i class="bi bi-recycle text-primary me-2"></i> Pemulihan Data (Trash)
          </h1>
          <p class="text-muted">Pulihkan data pegawai atau user yang telah dihapus sebelumnya</p>
        </div>
      </div>
    </div>

    <!-- Tabs Container -->
    <div class="card border-0 shadow-sm overflow-hidden">
      <div class="card-header bg-white border-bottom p-0">
        <ul class="nav nav-tabs border-0 px-3 pt-2">
          <li class="nav-item">
            <button
              class="nav-link px-4 py-2 border-0"
              :class="{ 'active border-bottom-primary': activeTab === 'employees' }"
              @click="activeTab = 'employees'"
            >
              <i class="bi bi-person-badge me-2"></i> Pegawai
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link px-4 py-2 border-0"
              :class="{ 'active border-bottom-primary': activeTab === 'users' }"
              @click="activeTab = 'users'"
            >
              <i class="bi bi-person-circle me-2"></i> User Login
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body">
        <!-- Search and Actions Bar -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                v-if="activeTab === 'employees'"
                v-model="employeeSearch"
                type="text"
                class="form-control border-start-0"
                placeholder="Cari pegawai by Nama atau NIP..."
              />
              <input
                v-else
                v-model="userSearch"
                type="text"
                class="form-control border-start-0"
                placeholder="Cari user by Username atau Nama..."
              />
            </div>
          </div>
          <div class="col-md-6 text-end">
            <button
              class="btn btn-outline-secondary btn-sm"
              @click="activeTab === 'employees' ? fetchDeletedEmployees() : fetchDeletedUsers()"
              :disabled="employeesLoading || usersLoading"
            >
              <i class="bi bi-arrow-clockwise me-1" :class="{ 'spinner-border spinner-border-sm border-0': employeesLoading || usersLoading }"></i> Refresh
            </button>
          </div>
        </div>

        <!-- Employees Content -->
        <div v-show="activeTab === 'employees'" class="tab-pane fade show active">
          <div v-if="employeesLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Memuat data pegawai deleted...</p>
          </div>
          <div v-else-if="deletedEmployees.length === 0" class="text-center py-5">
            <i class="bi bi-trash-fill text-light" style="font-size: 4rem"></i>
            <h5 class="mt-3 text-muted">Tidak ada pegawai yang dihapus</h5>
            <p class="text-muted small">Semua data pegawai masih aktif atau bersih</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 50px">No</th>
                  <th>Nama Pegawai</th>
                  <th>NIP</th>
                  <th>Jabatan / Departemen</th>
                  <th>Dihapus Pada</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(emp, i) in deletedEmployees" :key="emp.id">
                  <td class="text-muted small">{{ (employeePage - 1) * itemsPerPage + i + 1 }}</td>
                  <td>
                    <div class="fw-bold">{{ emp.name }}</div>
                    <small class="text-muted">{{ emp.email || '-' }}</small>
                  </td>
                  <td><code>{{ emp.nip }}</code></td>
                  <td>
                    <div class="small">{{ emp.position }}</div>
                    <div class="badge bg-light text-dark small border">{{ emp.department }}</div>
                  </td>
                  <td class="small">{{ formatDate(emp.deleted_at) }}</td>
                  <td class="text-center">
                    <button class="btn btn-success btn-sm px-3 rounded-pill" @click="handleRestore(emp.id, 'employee')">
                      <i class="bi bi-arrow-counterclockwise mr-1"></i> Pulihkan
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Users Content -->
        <div v-show="activeTab === 'users'" class="tab-pane fade show active">
          <div v-if="usersLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Memuat data user deleted...</p>
          </div>
          <div v-else-if="deletedUsers.length === 0" class="text-center py-5">
            <i class="bi bi-person-x-fill text-light" style="font-size: 4rem"></i>
            <h5 class="mt-3 text-muted">Tidak ada user yang dihapus</h5>
            <p class="text-muted small">Data user login masih dalam kondisi utuh</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 50px">No</th>
                  <th>Username</th>
                  <th>Nama Pegawai</th>
                  <th>Role Terakhir</th>
                  <th>Dihapus Pada</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, i) in deletedUsers" :key="user.id">
                  <td class="text-muted small">{{ (userPage - 1) * itemsPerPage + i + 1 }}</td>
                  <td>
                    <div class="fw-bold text-primary">@{{ user.username }}</div>
                    <small class="text-muted">ID: #{{ user.id }}</small>
                  </td>
                  <td>{{ user.employee_name }}</td>
                  <td>
                    <span class="badge bg-info text-dark">{{ user.role_name }}</span>
                  </td>
                  <td class="small">{{ formatDate(user.deleted_at) }}</td>
                  <td class="text-center">
                    <button class="btn btn-primary btn-sm px-3 rounded-pill" @click="handleRestore(user.id, 'user')">
                      <i class="bi bi-arrow-counterclockwise mr-1"></i> Pulihkan User
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer for Pagination -->
      <div v-if="activeTab === 'employees' && employeeTotalPages > 1" class="card-footer bg-white border-top text-center py-3">
        <ul class="pagination pagination-sm justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: employeePage === 1 }">
            <button class="page-link" @click="employeePage--">Prev</button>
          </li>
          <li v-for="p in employeeTotalPages" :key="p" class="page-item" :class="{ active: employeePage === p }">
            <button class="page-link" @click="employeePage = p">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: employeePage === employeeTotalPages }">
            <button class="page-link" @click="employeePage++">Next</button>
          </li>
        </ul>
      </div>
      <div v-else-if="activeTab === 'users' && userTotalPages > 1" class="card-footer bg-white border-top text-center py-3">
        <ul class="pagination pagination-sm justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: userPage === 1 }">
            <button class="page-link" @click="userPage--">Prev</button>
          </li>
          <li v-for="p in userTotalPages" :key="p" class="page-item" :class="{ active: userPage === p }">
            <button class="page-link" @click="userPage = p">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: userPage === userTotalPages }">
            <button class="page-link" @click="userPage++">Next</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      @close="modalConfig.isOpen = false"
      @confirm="executeRestore"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRecovery } from '~/composables/useRecovery'

const activeTab = ref('employees')
const {
  deletedEmployees,
  employeesLoading,
  employeePage,
  employeeSearch,
  employeeTotalPages,
  fetchDeletedEmployees,
  restoreEmployee,

  deletedUsers,
  usersLoading,
  userPage,
  userSearch,
  userTotalPages,
  fetchDeletedUsers,
  restoreUser,

  itemsPerPage
} = useRecovery()

const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as any,
  targetId: null as number | null,
  targetType: 'employee' as 'employee' | 'user'
})

onMounted(() => {
  fetchDeletedEmployees()
  fetchDeletedUsers()
})

const handleRestore = (id: number, type: 'employee' | 'user') => {
  modalConfig.targetId = id
  modalConfig.targetType = type
  modalConfig.title = 'Konfirmasi Pemulihan'
  modalConfig.message = `Apakah Anda yakin ingin memulihkan ${type === 'employee' ? 'pegawai' : 'user'} ini ke sistem aktif?`
  modalConfig.type = 'success'
  modalConfig.isOpen = true
}

const executeRestore = async () => {
  if (!modalConfig.targetId) return
  
  try {
    if (modalConfig.targetType === 'employee') {
      await restoreEmployee(modalConfig.targetId)
    } else {
      await restoreUser(modalConfig.targetId)
    }
    modalConfig.isOpen = false
  } catch (err: any) {
    alert(err)
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// SEO
useHead({ title: 'Recovery Module - JMC HRIS' })
</script>

<style scoped>
.recovery-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

.nav-tabs .nav-link {
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-tabs .nav-link.active {
  color: #3b82f6;
  background: transparent;
}

.border-bottom-primary {
  border-bottom: 3px solid #3b82f6 !important;
}

.table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: #64748b;
  border-top: none;
}
</style>
