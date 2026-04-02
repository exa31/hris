<template>
  <div class="transport-settings px-2 py-4">
    <!-- Header -->
    <div class="page-header mb-5">
      <div class="d-flex align-items-center gap-3">
        <NuxtLink to="/transport-allowance" class="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-none">
          <i class="bi bi-chevron-left"></i> Kembali
        </NuxtLink>
        <div>
            <h1 class="h4 mb-0 fw-bold">Pengaturan Tunjangan Transport</h1>
            <p class="text-muted small mb-0 font-monospace">Konfigurasi parameter perhitungan otomatis</p>
        </div>
      </div>
    </div>

    <div class="row g-4 justify-content-center">
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden animate__animated animate__fadeIn">
                <div class="card-header bg-primary py-3">
                    <h5 class="card-title text-white mb-0 fw-bold"><i class="bi bi-gear-fill me-2"></i>Parameter Utama</h5>
                </div>
                <div class="card-body p-4 p-md-5">
                    <form @submit.prevent="saveSettings">
                        <div class="mb-5">
                            <label class="form-label h6 fw-bold text-dark mb-3">Tarif Dasar per Kilometer <span class="text-danger">*</span></label>
                            <div class="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                                <span class="input-group-text bg-light border-0 px-4 text-primary fw-bold">Rp</span>
                                <input 
                                    v-model.number="baseFare" 
                                    type="number" 
                                    class="form-control bg-white border-0 py-3" 
                                    placeholder="5000"
                                    min="0"
                                    required
                                >
                            </div>
                            <div class="form-text mt-3 bg-light p-3 rounded-3 border-start border-primary border-4">
                                <i class="bi bi-info-circle-fill me-2 text-primary"></i> 
                                Tarif ini akan digunakan sebagai pengali dalam rumus: <br>
                                <span class="fw-bold text-dark text-decoration-underline mt-2 d-inline-block">Tarif &times; Jarak Efektif &times; Hari Kerja</span>
                            </div>
                        </div>

                        <!-- Rule Previews -->
                        <div class="row g-3 mb-5">
                            <div class="col-md-6">
                                <div class="p-3 border rounded-3 bg-white text-center">
                                    <div class="small text-muted mb-1">Batas Minimal Jarak</div>
                                    <div class="h5 fw-bold mb-0 text-primary">5 KM</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 border rounded-3 bg-white text-center">
                                    <div class="small text-muted mb-1">Batas Maksimal Jarak</div>
                                    <div class="h5 fw-bold mb-0 text-primary">25 KM</div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="p-3 border rounded-3 bg-white text-center">
                                    <div class="small text-muted mb-1">Minimum Hari Kerja per Bulan</div>
                                    <div class="h5 fw-bold mb-0 text-primary">19 Hari</div>
                                </div>
                            </div>
                        </div>

                        <div class="d-grid pt-2">
                            <button type="submit" class="btn btn-primary btn-lg rounded-pill py-3 shadow" :disabled="saving">
                                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                <i v-else class="bi bi-save me-2"></i> Simpan Pengaturan
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Audit Note -->
            <div class="mt-4 text-center">
                 <p class="text-muted small">
                     <i class="bi bi-shield-check me-1"></i> Perubahan tarif akan segera berlakku untuk input data baru mulai saat ini.
                 </p>
            </div>
        </div>
    </div>

    <!-- Feedback Modal -->
    <ConfirmModal
      :is-open="modalConfig.isOpen"
      :title="modalConfig.title"
      :message="modalConfig.message"
      :type="modalConfig.type"
      :is-confirm="false"
      @close="modalConfig.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

const { $axios } = useNuxtApp()

const baseFare = ref(5000)
const loading = ref(true)
const saving = ref(false)

const modalConfig = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'success' as any
})

onMounted(async () => {
    loading.value = true
    try {
        const res = await $axios.get('/api/transport-allowance/settings')
        if (res.data?.base_fare_per_km) {
            baseFare.value = parseFloat(res.data.base_fare_per_km)
        }
    } catch (e) {
        console.error('Failed to load settings:', e)
    } finally {
        loading.value = false
    }
})

const saveSettings = async () => {
    saving.value = true
    try {
        await $axios.post('/api/transport-allowance/settings', {
            base_fare_per_km: baseFare.value
        })
        modalConfig.title = 'Pengaturan Tersimpan'
        modalConfig.message = 'Tarif dasar transport telah berhasil diperbarui di sistem.'
        modalConfig.type = 'success'
        modalConfig.isOpen = true
    } catch (e: any) {
        modalConfig.title = 'Gagal Menyimpan'
        modalConfig.message = e.response?.data?.message || 'Terjadi kesalahan sistem saat menyimpan.'
        modalConfig.type = 'danger'
        modalConfig.isOpen = true
    } finally {
        saving.value = false
    }
}

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.transport-settings { max-width: 900px; margin: 0 auto; }
.card { transition: all 0.3s ease; }
.input-group-text { border-right: 1px solid #e2e8f0 !important; }
</style>
