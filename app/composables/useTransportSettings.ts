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

// Dummy settings (default)
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

export const useTransportSettings = () => {
    const updateSettings = (newSettings: Partial<TransportSettings>) => {
        settings.value = {
            ...settings.value,
            ...newSettings,
            lastUpdated: new Date().toISOString()
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
        formatCurrency
    }
}
