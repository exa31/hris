import { ref, computed } from 'vue'

export interface TransportSettings {
    baseFare: number // Rp per km
    tariffPerKm: number // Rp per km
    minDistance: number // km minimum
    maxDistance: number // km maximum
    minWorkingDays: number // minimum hari kerja per bulan
    lastUpdated: string
    updatedBy: string
}

// Dummy settings (default) - used as fallback
const defaultSettings: TransportSettings = {
    baseFare: 5000,
    tariffPerKm: 2000,
    minDistance: 5,
    maxDistance: 25,
    minWorkingDays: 19,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Admin'
}

// State
const settings = ref<TransportSettings>(defaultSettings)
const loading = ref(false)
const error = ref<string | null>(null)

export const useTransportSettings = () => {
    const fetchSettings = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await $fetch('/api/transport-allowance/settings')
            if (response && typeof response === 'object') {
                settings.value = {
                    baseFare: response.baseFare || response.base_fare_per_km || defaultSettings.baseFare,
                    tariffPerKm: response.tariffPerKm || response.base_fare_per_km || defaultSettings.tariffPerKm,
                    minDistance: response.minDistance || defaultSettings.minDistance,
                    maxDistance: response.maxDistance || defaultSettings.maxDistance,
                    minWorkingDays: response.minWorkingDays || defaultSettings.minWorkingDays,
                    lastUpdated: response.lastUpdated || response.updated_at || new Date().toISOString(),
                    updatedBy: response.updatedBy || response.updated_by || 'Admin'
                }
            }
        } catch (err: any) {
            error.value = err.data?.message || 'Gagal memuat pengaturan tunjangan transport'
            console.error('Failed to fetch transport settings:', err)
            // Keep using default settings on error
        } finally {
            loading.value = false
        }
    }

    const updateSettings = async (newSettings: Partial<TransportSettings>) => {
        loading.value = true
        error.value = null
        try {
            // Update local state
            settings.value = {
                ...settings.value,
                ...newSettings,
                lastUpdated: new Date().toISOString()
            }

            // Attempt to save to API
            const payload = {
                baseFare: settings.value.baseFare,
                tariffPerKm: settings.value.tariffPerKm,
                minDistance: settings.value.minDistance,
                maxDistance: settings.value.maxDistance,
                minWorkingDays: settings.value.minWorkingDays
            }

            await $fetch('/api/transport-allowance/settings', {
                method: 'PUT',
                body: payload
            })
        } catch (err: any) {
            error.value = err.data?.message || 'Gagal menyimpan pengaturan tunjangan transport'
            console.error('Failed to update transport settings:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const getSettings = () => {
        return settings.value
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    return {
        settings,
        getSettings,
        updateSettings,
        fetchSettings,
        loading,
        error,
        formatCurrency
    }
}
