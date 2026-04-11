<template>
  <div class="transport-allowance-list">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1><i class="bi bi-truck text-primary"></i> Tunjangan Transport</h1>
          <p class="text-muted mb-0">Data tunjangan transport pegawai — dihitung otomatis berdasarkan base fare × km × hari kerja</p>
        </div>
        <button
          v-if="hasPermission('transport_setting', 'create')"
          class="btn btn-primary shadow-sm rounded-pill px-4 d-flex align-items-center gap-2"
          @click="openGenerateModal"
          :disabled="generating"
        >
          <span v-if="generating" class="spinner-border spinner-border-sm"></span>
          <i v-else class="bi bi-lightning-charge-fill"></i>
          Generate Tunjangan
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="row g-3 mb-4 align-items-end">
      <div class="col-md-4">
        <label class="form-label small fw-bold">Cari Nama / NIP</label>
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0">
            <i class="bi bi-search text-muted"></i>
          </span>
          <input v-model="searchQuery" type="text" class="form-control border-start-0" placeholder="Ketik nama pegawai..." />
        </div>
      </div>
      <div class="col-md-2">
        <label class="form-label small fw-bold">Bulan</label>
        <select v-model.number="filterMonth" class="form-select">
          <option v-for="m in 12" :key="m" :value="m">
            {{ new Date(2026, m - 1).toLocaleDateString('id-ID', { month: 'long' }) }}
          </option>
        </select>
      </div>
      <div class="col-md-2">
        <label class="form-label small fw-bold">Tahun</label>
        <input v-model.number="filterYear" type="number" class="form-control" />
      </div>
      <div class="col-md-2">
        <button class="btn btn-outline-secondary w-100" @click="resetFilters">
          <i class="bi bi-arrow-clockwise"></i> Reset
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead class="bg-light">
            <tr>
              <th class="px-3 py-3" style="width: 50px">No</th>
              <th class="py-3" style="width: 110px">NIP</th>
              <th class="py-3">Nama</th>
              <th class="py-3">Tipe</th>
              <th class="py-3 text-center">Hari Kerja</th>
              <th class="py-3 text-center">Jarak (km)</th>
              <th class="py-3 text-center">KM Hitung</th>
              <th class="py-3 text-end">Base Fare</th>
              <th class="py-3 text-end px-4">Tunjangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="text-center py-5 text-muted">
                <div class="spinner-border text-primary spinner-border-sm me-2"></div>
                Memuat data...
              </td>
            </tr>
            <tr v-else-if="allowances.length === 0">
              <td colspan="9" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                Tidak ada data tunjangan transport untuk periode ini.
                <div v-if="hasPermission('transport_setting', 'create')" class="mt-3">
                  <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="openGenerateModal">
                    <i class="bi bi-lightning-charge-fill me-1"></i> Generate Sekarang
                  </button>
                </div>
              </td>
            </tr>
            <tr v-else v-for="(a, idx) in allowances" :key="a.id" :class="{ 'table-warning': Number(a.amount) === 0 }">
              <td class="px-3 text-muted small">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
              <td>
                <small class="text-monospace fw-bold text-primary">{{ a.nip }}</small>
              </td>
              <td>
                <span class="fw-medium text-dark">{{ a.employeeName }}</span>
              </td>
              <td>
                <span :class="[
                  'badge rounded-pill px-2',
                  a.employee_type === 'Tetap' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                ]">
                  {{ a.employee_type }}
                </span>
              </td>
              <td class="text-center">
                <span :class="[
                  'badge rounded-pill px-3',
                  Number(a.working_days) >= 19 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'
                ]">
                  {{ a.working_days }}
                </span>
              </td>
              <td class="text-center small">
                {{ Number(a.distance_km).toFixed(1) }}
              </td>
              <td class="text-center">
                <span class="fw-bold">{{ Number(a.calculated_km) }}</span>
              </td>
              <td class="text-end small text-muted">
                {{ formatCurrency(Number(a.base_fare)) }}
              </td>
              <td class="text-end px-4 fw-bold" :class="Number(a.amount) === 0 ? 'text-danger' : 'text-dark'">
                {{ formatCurrency(Number(a.amount)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-content-between align-items-center mt-4 px-1">
      <small class="text-muted">
        Total <span class="fw-bold">{{ totalAllowances }}</span> data
      </small>
      <nav v-if="totalPages > 1">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link shadow-none" @click="currentPage--"><i class="bi bi-chevron-left"></i></button>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
            <button class="page-link shadow-none" @click="currentPage = page">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link shadow-none" @click="currentPage++"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Summary -->
    <div v-if="allowances.length > 0" class="card mt-4 border-0 bg-primary-subtle rounded-3 p-3">
      <div class="row align-items-center text-center">
        <div class="col-md-3 border-end border-primary-subtle">
          <div class="small text-primary-emphasis mb-1">Periode</div>
          <div class="h6 mb-0 fw-bold">{{ getMonthYear() }}</div>
        </div>
        <div class="col-md-3 border-end border-primary-subtle">
          <div class="small text-primary-emphasis mb-1">Total Dana</div>
          <div class="h6 mb-0 fw-bold">{{ formatCurrency(totalAmount) }}</div>
        </div>
        <div class="col-md-3 border-end border-primary-subtle">
          <div class="small text-primary-emphasis mb-1">Eligible</div>
          <div class="h6 mb-0 fw-bold text-success">{{ eligibleCount }} pegawai</div>
        </div>
        <div class="col-md-3">
          <div class="small text-primary-emphasis mb-1">Tidak Eligible</div>
          <div class="h6 mb-0 fw-bold text-danger">{{ skippedCount }} pegawai</div>
        </div>
      </div>
    </div>

    <!-- Generate Modal -->
    <div class="modal fade" :class="{ show: showGenerateModal }" :style="{ display: showGenerateModal ? 'block' : 'none' }" @click.self="showGenerateModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header border-0 bg-primary text-white py-3 px-4">
            <h5 class="modal-title"><i class="bi bi-lightning-charge-fill me-2"></i>Generate Tunjangan Transport</h5>
            <button type="button" class="btn-close btn-close-white" @click="showGenerateModal = false"></button>
          </div>
          <div class="modal-body px-4 py-4">
            <p class="small text-muted mb-3">Sistem akan menghitung tunjangan untuk semua pegawai aktif berdasarkan aturan bisnis yang berlaku.</p>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label fw-bold small">Bulan</label>
                <select v-model.number="genMonth" class="form-select">
                  <option v-for="m in 12" :key="m" :value="m">
                    {{ new Date(2026, m - 1).toLocaleDateString('id-ID', { month: 'long' }) }}
                  </option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label fw-bold small">Tahun</label>
                <input v-model.number="genYear" type="number" class="form-control" />
              </div>
            </div>

            <div class="form-check mt-3">
              <input id="forceRegenerate" v-model="genForce" type="checkbox" class="form-check-input" />
              <label class="form-check-label small" for="forceRegenerate">
                <strong>Regenerate</strong> — Hapus data lama dan hitung ulang untuk periode ini
              </label>
            </div>

            <div class="alert alert-light border small mt-3 mb-0">
              <strong>Aturan yang diterapkan:</strong>
              <ul class="mb-0 mt-1 ps-3">
                <li>Tipe pegawai ≠ Tetap → Rp0</li>
                <li>Hari kerja &lt; 19 → Rp0</li>
                <li>Jarak ≤ 5 km → Rp0</li>
                <li>Jarak &gt; 25 km → dibatasi 25 km</li>
              </ul>
            </div>

            <div v-if="genError" class="alert alert-danger small mt-3 mb-0 py-2">
              <i class="bi bi-exclamation-circle me-1"></i>{{ genError }}
            </div>
            <div v-if="genSuccess" class="alert alert-success small mt-3 mb-0 py-2">
              <i class="bi bi-check-circle me-1"></i>{{ genSuccess }}
            </div>
          </div>
          <div class="modal-footer border-0 px-4 pb-4">
            <button type="button" class="btn btn-outline-secondary" @click="showGenerateModal = false">Batal</button>
            <button type="button" class="btn btn-primary" :disabled="generating" @click="handleGenerate">
              <span v-if="generating" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-lightning-charge-fill me-1"></i>
              {{ generating ? 'Memproses...' : (genForce ? 'Regenerate' : 'Generate') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showGenerateModal" class="modal-backdrop fade show" @click="showGenerateModal = false"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useTransportAllowance } from '~/composables/useTransportAllowance'
import { useAuth } from '~/composables/useAuth'
import { getErrorMessageAxios } from '~/utils/handleError'

const { hasPermission } = useAuth()

const {
  allowances, loading, generating, error,
  searchQuery, filterMonth, filterYear, currentPage, itemsPerPage,
  totalAllowances, totalPages,
  fetchAllowances, generateAllowances, getMonthYear, formatCurrency
} = useTransportAllowance()

// Generate modal state
const showGenerateModal = ref(false)
const genMonth = ref(new Date().getMonth() + 1)
const genYear = ref(new Date().getFullYear())
const genForce = ref(false)
const genError = ref<string | null>(null)
const genSuccess = ref<string | null>(null)

const totalAmount = computed(() =>
  allowances.value.reduce((sum, a) => sum + parseFloat(a.amount as any), 0)
)
const eligibleCount = computed(() =>
  allowances.value.filter(a => parseFloat(a.amount as any) > 0).length
)
const skippedCount = computed(() =>
  allowances.value.filter(a => parseFloat(a.amount as any) === 0).length
)

onMounted(() => fetchAllowances())
watch([filterMonth, filterYear, currentPage, searchQuery], () => fetchAllowances())

const resetFilters = () => {
  searchQuery.value = ''
  filterMonth.value = new Date().getMonth() + 1
  filterYear.value = new Date().getFullYear()
  currentPage.value = 1
}

const openGenerateModal = () => {
  genMonth.value = filterMonth.value
  genYear.value = filterYear.value
  genForce.value = false
  genError.value = null
  genSuccess.value = null
  showGenerateModal.value = true
}

const handleGenerate = async () => {
  genError.value = null
  genSuccess.value = null
  try {
    const result = await generateAllowances(genMonth.value, genYear.value, genForce.value)
    const data = result?.data || result
    genSuccess.value = result?.message || `Berhasil! ${data?.eligible_count || 0} eligible, ${data?.skipped_count || 0} tidak eligible.`

    filterMonth.value = genMonth.value
    filterYear.value = genYear.value
    currentPage.value = 1

    setTimeout(() => { showGenerateModal.value = false }, 1500)
  } catch (err: any) {
    genError.value = getErrorMessageAxios(err) || 'Gagal generate data tunjangan transport'
  }
}

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.transport-allowance-list { max-width: 1400px; margin: 0 auto; padding: 2rem 1rem; }
.page-header h1 { font-size: 2rem; }
.table-responsive { border-radius: 12px; }
.text-monospace { font-family: 'Courier New', Courier, monospace; letter-spacing: 0.05rem; }
.page-link:hover { background-color: var(--bs-primary-bg-subtle); color: var(--bs-primary); }
.modal { z-index: 1050; }
.modal-backdrop { z-index: 1040; }
</style>
