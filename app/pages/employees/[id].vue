<template>
  <div class="employee-detail" v-if="employee">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink to="/employees" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <h1 class="mb-0">{{ employee.nama }}</h1>
        <span 
          v-if="employee.statusAktif"
          class="badge bg-success ms-auto"
        >
          <i class="bi bi-check-circle"></i> Aktif
        </span>
        <span 
          v-else
          class="badge bg-danger ms-auto"
        >
          <i class="bi bi-x-circle"></i> Nonaktif
        </span>
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

    <!-- Tabs -->
    <ul class="nav nav-tabs" role="tablist" style="border-bottom: 2px solid #e2e8f0">
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link active" 
          @click="activeTab = 'info'"
          type="button"
          :class="{ active: activeTab === 'info' }"
        >
          <i class="bi bi-person"></i> Informasi Pribadi
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          @click="activeTab = 'work'"
          type="button"
          :class="{ active: activeTab === 'work' }"
        >
          <i class="bi bi-briefcase"></i> Data Kerja
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          @click="activeTab = 'education'"
          type="button"
          :class="{ active: activeTab === 'education' }"
        >
          <i class="bi bi-book"></i> Pendidikan
        </button>
      </li>
    </ul>

    <div class="tab-content mt-4">
      <!-- Tab 1: Informasi Pribadi -->
      <div v-if="activeTab === 'info'" class="tab-pane fade show active">
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body text-center">
                <div class="mb-3" v-if="employee.foto">
                  <img :src="employee.foto" class="img-fluid rounded" style="max-height: 300px" />
                </div>
                <div v-else class="placeholder-image mb-3">
                  <i class="bi bi-person-fill" style="font-size: 5rem"></i>
                </div>
                <h5>{{ employee.nama }}</h5>
                <p class="text-muted small">{{ employee.jabatan }} - {{ employee.departemen }}</p>
              </div>
            </div>
          </div>

          <div class="col-md-8">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Kontak</h6>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <p class="text-muted small">Email</p>
                    <p>{{ employee.email }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="text-muted small">Nomor HP</p>
                    <p>{{ employee.noHp }}</p>
                  </div>
                </div>

                <hr />

                <h6 class="card-title">Data Pribadi</h6>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <p class="text-muted small">Tanggal Lahir</p>
                    <p>{{ formatDate(employee.tanggalLahir) }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="text-muted small">Usia</p>
                    <p>{{ employee.usia }} tahun</p>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-md-6">
                    <p class="text-muted small">Tempat Lahir</p>
                    <p>{{ employee.tempatLahir }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="text-muted small">Status Kawin</p>
                    <p class="text-capitalize">{{ employee.statusKawin }}</p>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <p class="text-muted small">Jumlah Anak</p>
                    <p>{{ employee.jumlahAnak }} anak</p>
                  </div>
                </div>

                <hr />

                <h6 class="card-title">Alamat</h6>
                <p class="small text-muted">{{ employee.alamatKecamatan }}, {{ employee.alamatKabupaten }}, {{ employee.alamatProvinsi }}</p>
                <p>{{ employee.alamatLengkap }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Data Kerja -->
      <div v-if="activeTab === 'work'" class="tab-pane fade show active">
        <div class="card">
          <div class="card-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <p class="text-muted small">NIP</p>
                <p class="h6">{{ employee.nip }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small">Jabatan</p>
                <p class="h6">
                  <span class="badge bg-info">{{ employee.jabatan }}</span>
                </p>
              </div>
            </div>

            <div class="row mb-4">
              <div class="col-md-6">
                <p class="text-muted small">Departemen</p>
                <p class="h6">{{ employee.departemen }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small">Status</p>
                <p class="h6">
                  <span v-if="employee.statusAktif" class="badge bg-success">Aktif</span>
                  <span v-else class="badge bg-danger">Nonaktif</span>
                </p>
              </div>
            </div>

            <hr />

            <div class="row">
              <div class="col-md-6">
                <p class="text-muted small">Tanggal Masuk</p>
                <p class="h6">{{ formatDate(employee.tanggalMasuk) }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small">Masa Kerja</p>
                <p class="h6">{{ employee.masaKerja }} tahun</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Pendidikan -->
      <div v-if="activeTab === 'education'" class="tab-pane fade show active">
        <div v-if="employee.pendidikan && employee.pendidikan.length > 0">
          <div v-for="(edu, idx) in employee.pendidikan" :key="idx" class="card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="card-title">{{ edu.tingkat }}</h6>
                  <p class="text-muted">{{ edu.sekolah }}</p>
                  <small class="text-muted">Tahun Lulus: {{ edu.tahunLulus }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="alert alert-info">
          <i class="bi bi-info-circle"></i> Tidak ada data pendidikan
        </div>
      </div>
    </div>
  </div>

  <div v-else class="alert alert-warning">
    <i class="bi bi-exclamation-triangle"></i> Data pegawai tidak ditemukan
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEmployees } from '~/composables/useEmployees'

const route = useRoute()
const router = useRouter()
const activeTab = ref<'info' | 'work' | 'education'>('info')

const employeeId = computed(() => parseInt(route.params.id as string))

const employee = computed(() => {
  return useEmployees().getEmployee(employeeId.value)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const deleteThisEmployee = () => {
  if (confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
    useEmployees().deleteEmployee(employeeId.value)
    router.push('/employees')
  }
}

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.placeholder-image {
  width: 100%;
  height: 250px;
  background: #f1f5f9;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.nav-link {
  color: #64748b;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #667eea;
}

.nav-link.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.card {
  border: 1px solid #e2e8f0;
}
</style>
