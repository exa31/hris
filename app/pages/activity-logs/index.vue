<template>
  <div class="activity-logs py-4 px-2">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col-md-6">
          <h1 class="h3 fw-bold mb-1"><i class="bi bi-clock-history text-primary"></i> Log Aktivitas</h1>
          <p class="text-muted small">Rekam jejak seluruh interaksi pengguna dalam sistem</p>
        </div>
        <div class="col-md-6 text-md-end">
             <button class="btn btn-outline-secondary rounded-pill px-4" @click="fetchLogs">
                 <i class="bi bi-arrow-clockwise me-1"></i> Refresh
             </button>
        </div>
      </div>
    </div>

    <!-- Stats Row (Optional) -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                <div class="small text-muted mb-1 text-uppercase fw-bold">Total Log</div>
                <div class="h4 fw-bold mb-0 text-primary">{{ pagination.total }}</div>
            </div>
        </div>
    </div>

    <!-- Logs Table -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden animate__animated animate__fadeIn">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light border-0">
            <tr>
              <th class="py-3 px-4 text-muted small text-uppercase">Waktu</th>
              <th class="py-3 px-4 text-muted small text-uppercase">Pengguna</th>
              <th class="py-3 px-4 text-muted small text-uppercase">Aksi</th>
              <th class="py-3 px-4 text-muted small text-uppercase">Modul</th>
              <th class="py-3 px-4 text-muted small text-uppercase">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 5" :key="i">
                <td colspan="5" class="py-4 text-center">
                    <div class="placeholder-glow">
                        <span class="placeholder col-12 py-2 rounded"></span>
                    </div>
                </td>
            </tr>
            <tr v-else-if="logs.length === 0">
                <td colspan="5" class="py-5 text-center text-muted italic">
                    Belum ada data log aktivitas.
                </td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td class="px-4 py-3">
                <div class="d-flex flex-column">
                  <span class="fw-bold">{{ formatDate(log.created_at) }}</span>
                  <span class="text-muted small">{{ formatTime(log.created_at) }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                  <div class="d-flex align-items-center gap-2">
                       <div class="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold small" style="width: 32px; height: 32px;">
                           {{ log.user_name?.charAt(0).toUpperCase() }}
                       </div>
                       <div class="d-flex flex-column">
                           <span class="small fw-bold">{{ log.user_name }}</span>
                           <span class="text-muted x-small">@{{ log.username }}</span>
                       </div>
                  </div>
              </td>
              <td class="px-4 py-3">
                <span :class="getActionClass(log.action)" class="badge rounded-pill px-3 py-2 fw-medium text-uppercase">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-dark small fw-bold font-monospace border border-light p-1 px-2 rounded bg-light border-1">
                    {{ log.module }}
                </span>
              </td>
              <td class="px-4 py-3">
                  <p class="mb-0 small text-dark">{{ log.description }}</p>
                  <div v-if="log.metadata" class="mt-1 d-flex gap-2">
                      <span v-if="log.metadata.ip" class="x-small text-muted"><i class="bi bi-geo-alt"></i> IP: {{ log.metadata.ip }}</span>
                  </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="logs.length > 0" class="card-footer bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <div class="small text-muted">
          Menampilkan {{ pagination.offset + 1 }} - {{ Math.min(pagination.offset + pagination.limit, pagination.total) }} dari {{ pagination.total }} data
        </div>
        <div class="d-flex gap-2">
          <button 
            class="btn btn-outline-secondary btn-sm px-3 rounded-pill" 
            :disabled="pagination.offset === 0"
            @click="prevPage"
          >
            Sebelumnya
          </button>
          <button 
            class="btn btn-outline-primary btn-sm px-3 rounded-pill" 
            :disabled="pagination.offset + pagination.limit >= pagination.total"
            @click="nextPage"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const { $axios } = useNuxtApp()

const logs = ref<any[]>([])
const loading = ref(true)
const pagination = reactive({
    limit: 15,
    offset: 0,
    total: 0
})

const fetchLogs = async () => {
    loading.value = true
    try {
        const res = await $axios.get('/api/activity-logs', {
            params: {
                limit: pagination.limit,
                offset: pagination.offset
            }
        })
        logs.value = res.data.rows
        pagination.total = res.data.total
    } catch (e) {
        console.error('Failed to fetch logs:', e)
    } finally {
        loading.value = false
    }
}

const nextPage = () => {
    pagination.offset += pagination.limit
    fetchLogs()
}

const prevPage = () => {
    if (pagination.offset >= pagination.limit) {
        pagination.offset -= pagination.limit
        fetchLogs()
    }
}

const getActionClass = (action: string) => {
    switch (action) {
        case 'CREATE': return 'bg-success-subtle text-success border border-success border-opacity-10'
        case 'UPDATE': return 'bg-warning-subtle text-warning border border-warning border-opacity-10'
        case 'DELETE': return 'bg-danger-subtle text-danger border border-danger border-opacity-10'
        case 'LOGIN': return 'bg-primary-subtle text-primary border border-primary border-opacity-10'
        case 'LOGOUT': return 'bg-dark-subtle text-dark border border-dark border-opacity-10'
        default: return 'bg-secondary-subtle text-secondary'
    }
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(fetchLogs)

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.activity-logs { max-width: 1300px; margin: 0 auto; min-height: 100vh; }
.card { border-radius: 1.25rem !important; }
.table thead th { font-weight: 700; font-size: 0.75rem; letter-spacing: 0.05em; background-color: #f8fafc; }
.avatar-sm { font-size: 0.85rem; border: 2px solid #fff; }
.x-small { font-size: 0.7rem; }
.bg-primary-subtle { background-color: rgba(var(--bs-primary-rgb), 0.1); }
.text-primary { color: #2563eb !important; }
.badge { font-size: 0.7rem; letter-spacing: 0.02em; padding-top: 0.4em; padding-bottom: 0.4em; }

/* Micro-animations */
tr { transition: background-color 0.2s ease; }
tr:hover { background-color: rgba(37, 99, 235, 0.01) !important; }
</style>
