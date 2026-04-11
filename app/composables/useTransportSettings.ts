import { ref } from 'vue'
import { getErrorMessageAxios } from '~/utils/handleError'

export interface TransportSettingsData {
    id: number | null
    base_fare: number
    is_active: boolean
    updated_at?: string
}

const settings = ref<TransportSettingsData>({
    id: null,
    base_fare: 2000,
    is_active: true,
})

const loading = ref(false)
const error = ref<string | null>(null)

export const useTransportSettings = () => {
    const { $axios } = useNuxtApp()

    const fetchSettings = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await $axios.get('/api/transport-allowance/settings')
            const data = response.data?.data || response.data
            settings.value = {
                id: data.id,
                base_fare: data.base_fare || 2000,
                is_active: data.is_active ?? true,
                updated_at: data.updated_at,
            }
        } catch (err: any) {
            error.value = getErrorMessageAxios(err) || 'Gagal memuat pengaturan'
        } finally {
            loading.value = false
        }
    }

    const updateSettings = async (data: { base_fare: number; is_active: boolean }) => {
        loading.value = true
        error.value = null
        try {
            const response = await $axios.put('/api/transport-allowance/settings', data)
            const result = response.data?.data || response.data
            settings.value = {
                id: result.id,
                base_fare: result.base_fare,
                is_active: result.is_active,
                updated_at: result.updated_at,
            }
            return result
        } catch (err: any) {
            const message = getErrorMessageAxios(err) || 'Gagal menyimpan pengaturan'
            error.value = message
            throw new Error(message)
        } finally {
            loading.value = false
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value)
    }

    return {
        settings,
        loading,
        error,
        fetchSettings,
        updateSettings,
        formatCurrency,
    }
}
