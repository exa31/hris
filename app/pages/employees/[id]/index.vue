<template>
  <div class="employee-detail" v-if="employee">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center gap-3 mb-3">
        <NuxtLink to="/employees" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
      </div>
      <div class="d-flex align-items-center">
        <div>
          <h1 class="mb-0">{{ employee.name }}</h1>
          <span 
            v-if="employee.status"
            class="badge bg-success mt-1"
          >
            <i class="bi bi-check-circle"></i> Aktif
          </span>
          <span 
            v-else
            class="badge bg-danger mt-1"
          >
            <i class="bi bi-x-circle"></i> Nonaktif
          </span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mb-3">
      <NuxtLink 
        :to="`/employees/${employee.id}/edit`"
        class="btn btn-primary"
      >
        <i class="bi bi-pencil"></i> Edit
      </NuxtLink>
      <button class="btn btn-outline-danger ms-2" @click="deleteThisEmployee">
        <i class="bi bi-trash"></i> Hapus
      </button>
    </div>

    <!-- Info Cards -->
    <div class="row">
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">Informasi Kontak</h6>
            <hr />
            <div class="mb-3">
              <p class="text-muted small">Email</p>
              <p class="mb-0">{{ employee.email }}</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Nomor HP</p>
              <p class="mb-0">{{ employee.phone }}</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Alamat Lengkap</p>
              <p class="mb-0">{{ employee.full_address || '-' }}</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Kecamatan/Kabupaten/Provinsi</p>
              <p class="mb-0">{{ employee.districtName || '-' }}, {{ employee.regencyName || '-' }}, {{ employee.provinceName || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">Data Kerja</h6>
            <hr />
            <div class="mb-3">
              <p class="text-muted small">NIP</p>
              <p class="mb-0 h6">{{ employee.nip }}</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Jabatan</p>
              <p class="mb-0"><span class="badge bg-info">{{ employee.position }}</span></p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Departemen</p>
              <p class="mb-0"><span class="badge bg-secondary">{{ employee.department }}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">Data Pribadi</h6>
            <hr />
            <div class="mb-3">
              <p class="text-muted small">Tempat, Tanggal Lahir</p>
              <p class="mb-0">{{ employee.birthCityName || '-' }}, {{ formatDate(employee.birth_date) }}</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Usia</p>
              <p class="mb-0">{{ calculateAge(employee.birth_date, employee.join_date) }} Tahun</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Jenis Kelamin</p>
              <p class="mb-0">{{ employee.gender }}</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Status Kawin</p>
              <p class="mb-0 text-capitalize">{{ employee.marital_status }}</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Jumlah Anak</p>
              <p class="mb-0">{{ employee.children_count }} anak</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Riwayat Pendidikan</p>
              <div v-if="employee.educations && employee.educations.length > 0" class="d-flex flex-wrap gap-2 mt-1">
                <span 
                  v-for="edu in employee.educations" 
                  :key="edu.id" 
                  class="badge bg-light text-primary border border-primary-subtle px-3 py-2 fw-medium"
                >
                  <i class="bi bi-mortarboard me-1"></i> {{ edu.name }}
                </span>
              </div>
              <p class="mb-0 text-muted italic" v-else>-</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">Kontrak Kerja</h6>
            <hr />
            <div class="mb-3">
              <p class="text-muted small">Tanggal Masuk</p>
              <p class="mb-0">{{ formatDate(employee.join_date) }}</p>
            </div>
            <div class="mb-3">
              <p class="text-muted small">Tipe Kontrak</p>
              <p class="mb-0"><span class="badge bg-warning">{{ employee.type }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="alert alert-warning">
    <i class="bi bi-exclamation-triangle"></i> Data pegawai tidak ditemukan
  </div>
   <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :is-confirm="modalConfig.isConfirm"
      @close="modalConfig.isOpen = false"
      @confirm="handleConfirmDelete"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useEmployees } from '~/composables/useEmployees'

const route = useRoute()
const router = useRouter()

const employeeId = computed(() => parseInt(route.params.id as string))
const employee = ref<any>(null)
const loading = ref(false)

// Modal State
const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'primary' as 'primary' | 'danger' | 'warning' | 'success',
  isConfirm: true
})

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const calculateAge = (birthDate: string, joinDate: string) => {
  if (!birthDate || !joinDate) return '-';
  const birth = new Date(birthDate)
  const join = new Date(joinDate)
  let age = join.getFullYear() - birth.getFullYear()
  if (join.getMonth() < birth.getMonth() || (join.getMonth() === birth.getMonth() && join.getDate() < birth.getDate())) {
    age--
  }
  return age > 0 ? age : 0
}

const deleteThisEmployee = () => {
  modalConfig.title = 'Hapus Pegawai'
  modalConfig.message = 'Apakah Anda yakin ingin menghapus data pegawai ini secara permanen?'
  modalConfig.type = 'danger'
  modalConfig.isConfirm = true
  modalConfig.isOpen = true
}

const handleConfirmDelete = async () => {
    modalConfig.isOpen = false
    try {
        await useEmployees().deleteEmployee(employeeId.value)
        router.push('/employees')
    } catch (error) {
        modalConfig.title = 'Error'
        modalConfig.message = 'Gagal menghapus data!'
        modalConfig.type = 'danger'
        modalConfig.isConfirm = false
        modalConfig.isOpen = true
    }
}

onMounted(async () => {
  loading.value = true
  try {
    employee.value = await useEmployees().getEmployee(employeeId.value)
  } catch (error) {
    console.error('Failed to load employee:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.employee-detail {
  padding: 0;
}

.page-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}
</style>
        