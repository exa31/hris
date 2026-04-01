import { ref } from 'vue'

// API Response Interfaces (Sesuai dengan Database Schema)
export interface Region {
    id: number
    name: string
}

export interface ProvinsiResponse extends Region { }

export interface KabupatenResponse extends Region {
    province_id: number
}

export interface KecamatanResponse extends Region {
    regency_id: number
}

// Local Cache Interfaces
interface RegionCache {
    provinsi: ProvinsiResponse[]
    kabupaten: KabupatenResponse[]
    kecamatan: KecamatanResponse[]
}

// Dummy Data (Sesuai dengan Database Schema)
const dummyProvinsi: ProvinsiResponse[] = [
    { id: 1, name: 'DKI Jakarta' },
    { id: 2, name: 'Jawa Barat' },
    { id: 3, name: 'Jawa Tengah' },
    { id: 4, name: 'Jawa Timur' },
    { id: 5, name: 'Banten' },
    { id: 6, name: 'Sumatera Utara' },
    { id: 7, name: 'Sumatera Barat' },
    { id: 8, name: 'Riau' },
    { id: 9, name: 'Jambi' },
    { id: 10, name: 'Sumatera Selatan' }
]

const dummyKabupaten: KabupatenResponse[] = [
    // DKI Jakarta
    { id: 101, name: 'Jakarta Pusat', province_id: 1 },
    { id: 102, name: 'Jakarta Utara', province_id: 1 },
    { id: 103, name: 'Jakarta Timur', province_id: 1 },
    { id: 104, name: 'Jakarta Selatan', province_id: 1 },
    { id: 105, name: 'Jakarta Barat', province_id: 1 },
    // Jawa Barat
    { id: 201, name: 'Bandung', province_id: 2 },
    { id: 202, name: 'Bekasi', province_id: 2 },
    { id: 203, name: 'Karawang', province_id: 2 },
    { id: 204, name: 'Purwakarta', province_id: 2 },
    { id: 205, name: 'Subang', province_id: 2 },
    // Jawa Tengah
    { id: 301, name: 'Semarang', province_id: 3 },
    { id: 302, name: 'Solo', province_id: 3 },
    { id: 303, name: 'Yogyakarta', province_id: 3 },
    { id: 304, name: 'Pekalongan', province_id: 3 },
    // Jawa Timur
    { id: 401, name: 'Surabaya', province_id: 4 },
    { id: 402, name: 'Malang', province_id: 4 },
    { id: 403, name: 'Gresik', province_id: 4 },
    // Banten
    { id: 501, name: 'Serang', province_id: 5 },
    { id: 502, name: 'Tangerang', province_id: 5 }
]

const dummyKecamatan: KecamatanResponse[] = [
    // Jakarta Pusat
    { id: 1001, name: 'Menteng', regency_id: 101 },
    { id: 1002, name: 'Sawah Luhur', regency_id: 101 },
    { id: 1003, name: 'Tebet', regency_id: 101 },
    // Jakarta Timur
    { id: 1101, name: 'Kramat Jati', regency_id: 103 },
    { id: 1102, name: 'Makasar', regency_id: 103 },
    { id: 1103, name: 'Pasarauan', regency_id: 103 },
    // Jakarta Utara
    { id: 1201, name: 'Penjaringan', regency_id: 102 },
    { id: 1202, name: 'Ancol', regency_id: 102 },
    // Jakarta Selatan
    { id: 1301, name: 'Blok M', regency_id: 104 },
    { id: 1302, name: 'Tebet', regency_id: 104 },
    // Jakarta Barat
    { id: 1401, name: 'Kebon Jeruk', regency_id: 105 },
    { id: 1402, name: 'Grogol', regency_id: 105 },
    // Bandung
    { id: 2001, name: 'Bandung', regency_id: 201 },
    { id: 2002, name: 'Cibiru', regency_id: 201 },
    // Bekasi
    { id: 2101, name: 'Bekasi', regency_id: 202 },
    { id: 2102, name: 'Medan', regency_id: 202 }
]

// Local Cache
const cache = ref<RegionCache>({
    provinsi: dummyProvinsi,
    kabupaten: dummyKabupaten,
    kecamatan: dummyKecamatan
})

export const useRegion = () => {
    /**
     * Fetch All Provinsi
     * TODO: Replace with API call to /api/region/provinces
     */
    const getProvinsi = async (): Promise<ProvinsiResponse[]> => {
        // return await $fetch('/api/region/provinces')
        return cache.value.provinsi
    }

    /**
     * Fetch Kabupaten by Provinsi ID
     * TODO: Replace with API call to /api/region/regencies?province_id=xxx
     */
    const getKabupaten = async (provinsiId?: number): Promise<KabupatenResponse[]> => {
        if (!provinsiId) {
            // return await $fetch('/api/region/regencies')
            return cache.value.kabupaten
        }
        // return await $fetch(`/api/region/regencies?province_id=${provinsiId}`)
        return cache.value.kabupaten.filter(k => k.province_id === provinsiId)
    }

    /**
     * Fetch Kecamatan by Kabupaten ID
     * TODO: Replace with API call to /api/region/districts?regency_id=xxx
     */
    const getKecamatan = async (kabupatenId?: number): Promise<KecamatanResponse[]> => {
        if (!kabupatenId) {
            // return await $fetch('/api/region/districts')
            return cache.value.kecamatan
        }
        // return await $fetch(`/api/region/districts?regency_id=${kabupatenId}`)
        return cache.value.kecamatan.filter(k => k.regency_id === kabupatenId)
    }

    const getProvinsiById = (id: number): ProvinsiResponse | undefined => {
        return cache.value.provinsi.find(p => p.id === id)
    }

    const getKabupatenById = (id: number): KabupatenResponse | undefined => {
        return cache.value.kabupaten.find(k => k.id === id)
    }

    const getKecamatanById = (id: number): KecamatanResponse | undefined => {
        return cache.value.kecamatan.find(k => k.id === id)
    }

    const getProvinsiIdByKabupatenId = (kabupatenId: number): number | undefined => {
        const kab = getKabupatenById(kabupatenId)
        return kab?.province_id
    }

    const getKabupatenIdByKecamatanId = (kecamatanId: number): number | undefined => {
        const kec = getKecamatanById(kecamatanId)
        return kec?.regency_id
    }

    return {
        getProvinsi,
        getKabupaten,
        getKecamatan,
        getProvinsiById,
        getKabupatenById,
        getKecamatanById,
        getProvinsiIdByKabupatenId,
        getKabupatenIdByKecamatanId
    }
}
