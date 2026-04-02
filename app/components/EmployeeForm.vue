<template>
  <form @submit.prevent="submitForm" class="needs-validation">


    <!-- NIP & Name -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">NIP <span class="text-danger">*</span></label>
        <input
          v-model.number="form.nip"
          type="number"
          class="form-control"
          placeholder="Contoh: 2024003121211212"
          :class="{ 'is-invalid': errors.nip }"
        />
        <small v-if="errors.nip" class="text-danger d-block mt-1">{{ errors.nip }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Nama Pegawai <span class="text-danger">*</span></label>
        <input
          v-model="form.name"
          type="text"
          class="form-control"
          placeholder="Nama lengkap"
          :class="{ 'is-invalid': errors.name }"
          @input="form.name = form.name.replace(/[^A-Za-z0-9'\s]/g, '')"
        />
        <small v-if="errors.name" class="text-danger d-block mt-1">{{ errors.name }}</small>
      </div>
    </div>

    <!-- Email & Phone -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Email <span class="text-danger">*</span></label>
        <input
          v-model="form.email"
          type="email"
          class="form-control"
          placeholder="email@company.com"
          :class="{ 'is-invalid': errors.email }"
        />
        <small v-if="errors.email" class="text-danger d-block mt-1">{{ errors.email }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Nomor HP <span class="text-danger">*</span></label>
        <input
          v-model="form.phone"
          type="tel"
          class="form-control"
          placeholder="+6282218458888"
          :class="{ 'is-invalid': errors.phone }"
        />
        <small v-if="errors.phone" class="text-danger d-block mt-1">{{ errors.phone }}</small>
      </div>
    </div>

    <!-- Row 3: Birth Date, Birth Place, Gender -->
    <div class="row mb-3">
      <div class="col-md-4">
        <label class="form-label">Tanggal Lahir <span class="text-danger">*</span></label>
        <input
          v-model="form.birth_date"
          type="date"
          class="form-control"
          :max="new Date().toISOString().split('T')[0]"
          :class="{ 'is-invalid': errors.birth_date }"
        />
        <small v-if="errors.birth_date" class="text-danger d-block mt-1">{{ errors.birth_date }}</small>
      </div>
      
      <div class="col-md-4">
        <label class="form-label">Tempat Lahir (Kabupaten) <span class="text-danger">*</span></label>
        <div class="position-relative">
          <input
            v-model="form.birthCityName"
            type="text"
            class="form-control"
            placeholder="Ketik minimal 3 karakter..."
            :class="{ 'is-invalid': errors.birthCityName }"
            @input="searchBirthCity"
          />
          <ul v-if="birthCitySuggestions.length" class="list-group position-absolute z-3 w-100 shadow-sm" style="max-height: 200px; overflow-y: auto; top: 100%; left: 0;">
            <li 
              v-for="city in birthCitySuggestions" :key="city.id" 
              class="list-group-item list-group-item-action cursor-pointer"
              @click="selectBirthCity(city)"
            >
              {{ city.name }}
            </li>
          </ul>
        </div>
        <small v-if="errors.birthCityName" class="text-danger d-block mt-1">{{ errors.birthCityName }}</small>
      </div>

      <div class="col-md-4">
        <label class="form-label">Jenis Kelamin <span class="text-danger">*</span></label>
        <select
          v-model="form.gender"
          class="form-select"
          :class="{ 'is-invalid': errors.gender }"
        >
          <option value="">Pilih Jenis Kelamin</option>
          <option value="Male">Laki-laki</option>
          <option value="Female">Perempuan</option>
          <option value="Other">Lainnya</option>
        </select>
        <small v-if="errors.gender" class="text-danger d-block mt-1">{{ errors.gender }}</small>
      </div>
    </div>

    <!-- Marital Status & Children -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Status Kawin <span class="text-danger">*</span></label>
        <select
          v-model="form.marital_status"
          class="form-select"
          :class="{ 'is-invalid': errors.marital_status }"
        >
          <option value="">Pilih Status</option>
          <option value="Single">Belum Kawin</option>
          <option value="Married">Kawin</option>
          <option value="Divorced">Cerai</option>
          <option value="Widowed">Janda/Duda</option>
        </select>
        <small v-if="errors.marital_status" class="text-danger d-block mt-1">{{ errors.marital_status }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Jumlah Anak</label>
        <input
          v-model.number="form.children_count"
          type="number"
          min="0"
          class="form-control"
          :class="{ 'is-invalid': errors.children_count }"
        />
        <small v-if="errors.children_count" class="text-danger d-block mt-1">{{ errors.children_count }}</small>
      </div>
    </div>

    <!-- Address -->
    <div class="row mb-3">
      <div class="col-md-4">
        <label class="form-label">Kecamatan</label>
        <div class="position-relative">
          <input
            v-model="form.districtName"
            type="text"
            class="form-control"
            placeholder="Minimal 3 karakter..."
            @input="searchDistrict"
          />
          <ul v-if="districtSuggestions.length" class="list-group position-absolute z-3 w-100 mt-1 shadow-sm" style="max-height: 200px; overflow-y: auto; top: 100%; left: 0;">
            <li 
              v-for="district in districtSuggestions" :key="district.id" 
              class="list-group-item list-group-item-action cursor-pointer"
              @click="selectDistrict(district)"
              style="cursor: pointer;"
            >
              {{ district.name }}
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-4">
        <label class="form-label">Kabupaten</label>
        <input
          :value="form.regencyName"
          type="text"
          class="form-control"
          disabled
        />
      </div>
      <div class="col-md-4">
        <label class="form-label">Provinsi</label>
        <input
          :value="form.provinceName"
          type="text"
          class="form-control"
          disabled
        />
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-12">
        <label class="form-label">Alamat Lengkap</label>
        <textarea
          v-model="form.full_address"
          class="form-control"
          rows="2"
          placeholder="Detail alamat..."
        ></textarea>
      </div>
    </div>

    <!-- Position & Department -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Jabatan <span class="text-danger">*</span></label>
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" v-model="form.position" value="Manager" id="posManager" autocomplete="off">
          <label class="btn btn-outline-primary" for="posManager">Manager</label>

          <input type="radio" class="btn-check" v-model="form.position" value="Staf" id="posStaf" autocomplete="off">
          <label class="btn btn-outline-primary" for="posStaf">Staf</label>

          <input type="radio" class="btn-check" v-model="form.position" value="Magang" id="posMagang" autocomplete="off">
          <label class="btn btn-outline-primary" for="posMagang">Magang</label>
        </div>
        <small v-if="errors.position" class="text-danger d-block mt-1">{{ errors.position }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Departemen <span class="text-danger">*</span></label>
        <select
          v-model="form.department"
          class="form-select"
          :class="{ 'is-invalid': errors.department }"
        >
          <option value="">Pilih Departemen</option>
          <option value="HRD">HRD</option>
          <option value="Marketing">Marketing</option>
          <option value="Production">Production</option>
          <option value="Executive">Executive</option>
          <option value="Commissioner">Commissioner</option>
        </select>
        <small v-if="errors.department" class="text-danger d-block mt-1">{{ errors.department }}</small>
      </div>
    </div>

    <!-- Join Date & Employment Type -->
    <div class="row mb-3">
      <div class="col-md-4">
        <label class="form-label">Tanggal Masuk <span class="text-danger">*</span></label>
        <input
          v-model="form.join_date"
          type="date"
          class="form-control"
          :class="{ 'is-invalid': errors.join_date }"
        />
        <small v-if="errors.join_date" class="text-danger d-block mt-1">{{ errors.join_date }}</small>
      </div>

      <div class="col-md-4">
        <label class="form-label">Usia (Tahun)</label>
        <input
          :value="calculatedAge"
          type="text"
          class="form-control"
          disabled
        />
      </div>

      <div class="col-md-4">
        <label class="form-label">Tipe Kontrak <span class="text-danger">*</span></label>
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" v-model="form.type" value="Tetap" id="typeTetap" autocomplete="off">
          <label class="btn btn-outline-success" for="typeTetap">Tetap</label>

          <input type="radio" class="btn-check" v-model="form.type" value="Kontrak" id="typeKontrak" autocomplete="off">
          <label class="btn btn-outline-success" for="typeKontrak">Kontrak</label>

          <input type="radio" class="btn-check" v-model="form.type" value="Magang" id="typeMagang" autocomplete="off">
          <label class="btn btn-outline-success" for="typeMagang">Magang</label>
        </div>
        <small v-if="errors.type" class="text-danger d-block mt-1">{{ errors.type }}</small>
      </div>
    </div>

    <!-- Educations -->
    <div class="row mb-3">
      <div class="col-12">
        <label class="form-label d-flex justify-content-between align-items-center">
          Pendidikan
          <span class="badge bg-secondary rounded-pill" v-if="selectedEducations.length">{{ selectedEducations.length }} terpilih</span>
        </label>
        
        <div class="card bg-light border-0">
          <div class="card-body p-3">
            <!-- Add/Selection Logic -->
            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <div class="input-group input-group-sm">
                  <select v-model="selectedEducationId" class="form-select">
                    <option value="">-- Pilih Master Data --</option>
                    <option v-for="edu in availableEducations" :key="edu.id" :value="edu.id">
                      {{ edu.name }}
                    </option>
                  </select>
                  <button type="button" class="btn btn-primary" @click="addSelectedEducation" :disabled="!selectedEducationId">
                    Tambah
                  </button>
                  <button type="button" class="btn btn-outline-danger" @click="deleteGlobalEducation" :disabled="!selectedEducationId" title="Hapus dari Master">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <div class="input-group input-group-sm">
                  <input 
                    v-model="newEducationName" 
                    type="text" 
                    class="form-control" 
                    placeholder="Nama pendidikan baru..."
                    @keyup.enter="createNewEducation"
                  />
                  <button type="button" class="btn btn-success" @click="createNewEducation" :disabled="!newEducationName">
                    Buat Baru
                  </button>
                </div>
              </div>
            </div>

            <!-- Chips Display -->
            <div class="d-flex flex-wrap gap-2 pt-2 border-top">
              <div v-for="edu in selectedEducations" :key="edu.id" 
                class="badge bg-white text-dark border d-flex align-items-center gap-2 p-2 shadow-sm"
                style="font-weight: 500; font-size: 0.85rem;"
              >
                <i class="bi bi-mortarboard text-primary"></i>
                {{ edu.name }}
                <button type="button" class="btn-close" style="font-size: 0.6rem;" @click="removeSelectedEducation(edu.id)"></button>
              </div>
              <div v-if="selectedEducations.length === 0" class="text-muted small py-1">
                <i class="bi bi-info-circle me-1"></i> Belum ada riwayat pendidikan yang ditambahkan
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Status <span class="text-danger">*</span></label>
        <div class="form-check">
          <input
            id="status"
            v-model="form.status"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="status">
            Aktif
          </label>
        </div>
      </div>
    </div>

    <!-- Submit & Cancel Buttons -->
    <div class="row mt-4">
      <div class="col-12">
        <button type="submit" class="btn btn-primary me-2">
          <i class="bi bi-check-circle me-2"></i>
          Simpan Data
        </button>
        <NuxtLink to="/employees" class="btn btn-outline-secondary">
          <i class="bi bi-x-circle me-2"></i>
          Batal
        </NuxtLink>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Employee } from '~/composables/useEmployees'
import { useEducations } from '~/composables/useEducations'
import type { Education } from '~/composables/useEducations'

const props = defineProps<{
  initialData?: Partial<Employee>
}>()

const emit = defineEmits<{
  submit: [data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>]
}>()

const formatDateForInput = (dateString: string | undefined | null) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toISOString().split('T')[0]
  } catch (e) {
    return ''
  }
}

const form = ref({
  nip: props.initialData?.nip || 0,
  name: props.initialData?.name || '',
  email: props.initialData?.email || '',
  phone: props.initialData?.phone || '',
  birth_date: formatDateForInput(props.initialData?.birth_date as string | undefined) || '',
  birth_place_id: props.initialData?.birth_place_id || 0,
  birthCityName: props.initialData?.birthCityName || '',
  gender: props.initialData?.gender || '',
  marital_status: props.initialData?.marital_status || '',
  children_count: props.initialData?.children_count ?? 0,
  position: props.initialData?.position || '',
  department: props.initialData?.department || '',
  join_date: formatDateForInput(props.initialData?.join_date as string | undefined) || '',
  type: props.initialData?.type || '',
  status: props.initialData?.status ?? true,
  district_id: props.initialData?.district_id || 0,
  districtName: props.initialData?.districtName || '',
  regencyName: props.initialData?.regencyName || '',
  provinceName: props.initialData?.provinceName || '',
  full_address: props.initialData?.full_address || '',
  educations: props.initialData?.educations ? [...props.initialData.educations] : ([] as string[])
})

// Education Management
const { fetchEducations, createEducation, syncEmployeeEducations, removeGlobalEducation } = useEducations()
const availableEducations = ref<Education[]>([])
const selectedEducations = ref<Education[]>(props.initialData?.educations || [])
const selectedEducationId = ref<number | string>('')
const newEducationName = ref<string>('')
const educationLoading = ref(false)
const educationError = ref<string>('')

onMounted(async () => {
  // Fetch available educations from API
  educationLoading.value = true
  try {
    availableEducations.value = await fetchEducations()
  } catch (e) {
    educationError.value = 'Gagal memuat daftar pendidikan'
  } finally {
    educationLoading.value = false
  }
})

const addSelectedEducation = () => {
  if (!selectedEducationId.value) return

  const selectedId = Number(selectedEducationId.value)
  const education = availableEducations.value.find(e => e.id === selectedId)

  if (education && !selectedEducations.value.find(e => e.id === education.id)) {
    selectedEducations.value.push(education)
    selectedEducationId.value = ''
  }
}

const deleteGlobalEducation = async () => {
  if (!selectedEducationId.value) return
  const confirmed = confirm('Apakah Anda yakin ingin menghapus pendidikan ini dari data master?')
  if (!confirmed) return

  educationLoading.value = true
  try {
    await removeGlobalEducation(Number(selectedEducationId.value))
    // Hapus jg dari dropdown dan dari selected jika ada
    availableEducations.value = availableEducations.value.filter(e => e.id !== Number(selectedEducationId.value))
    removeSelectedEducation(Number(selectedEducationId.value))
    selectedEducationId.value = ''
    alert('Pendidikan berhasil dihapus')
  } catch (err: any) {
    alert(err.message || 'Gagal menghapus pendidikan (mungkin sedang digunakan)')
  } finally {
    educationLoading.value = false
  }
}

const createNewEducation = async () => {
  if (!newEducationName.value.trim()) return

  educationLoading.value = true
  try {
    const newEducation = await createEducation(newEducationName.value)
    if (newEducation) {
      availableEducations.value.push(newEducation)
      selectedEducations.value.push(newEducation)
      newEducationName.value = ''
    }
  } catch (e) {
    educationError.value = 'Gagal membuat pendidikan baru'
  } finally {
    educationLoading.value = false
  }
}

const removeSelectedEducation = (educationId: number) => {
  selectedEducations.value = selectedEducations.value.filter(e => e.id !== educationId)
}

const calculatedAge = computed(() => {
  if (form.value.birth_date && form.value.join_date) {
    const birth = new Date(form.value.birth_date)
    const join = new Date(form.value.join_date)
    let age = join.getFullYear() - birth.getFullYear()
    if (join.getMonth() < birth.getMonth() || (join.getMonth() === birth.getMonth() && join.getDate() < birth.getDate())) {
      age--
    }
    return age > 0 ? age : 0
  }
  return '-'
})

// Autocomplete Logic
const { $axios } = useNuxtApp()

const debounce = (fn: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

const birthCitySuggestions = ref<any[]>([])
const searchBirthCity = debounce(async () => {
  if (form.value.birthCityName.length >= 3) {
    try {
      const res = await $axios.get('/api/locations/regencies', { params: { q: form.value.birthCityName } })
      birthCitySuggestions.value = res.data || []
    } catch (e) {
      birthCitySuggestions.value = []
    }
  } else {
    birthCitySuggestions.value = []
  }
}, 400)
const selectBirthCity = (city: any) => {
  form.value.birthCityName = city.name
  form.value.birth_place_id = city.id
  birthCitySuggestions.value = []
}

const districtSuggestions = ref<any[]>([])
const searchDistrict = debounce(async () => {
  if (form.value.districtName.length >= 3) {
    try {
      const res = await $axios.get('/api/locations/districts', { params: { q: form.value.districtName } })
      districtSuggestions.value = res.data || []
    } catch (e) {
      districtSuggestions.value = []
    }
  } else {
    districtSuggestions.value = []
  }
}, 400)
const selectDistrict = (district: any) => {
  form.value.district_id = district.id
  form.value.districtName = district.name
  form.value.regencyName = district.regency
  form.value.provinceName = district.province
  districtSuggestions.value = []
}

const errors = ref<Record<string, string>>({})
const hasSubmitted = ref(false)

const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.nip || form.value.nip <= 0) {
    errors.value.nip = 'NIP harus berupa angka positif'
  }

  if (!form.value.name || form.value.name.trim() === '') {
    errors.value.name = 'Nama harus diisi'
  }

  if (!form.value.email || form.value.email.trim() === '') {
    errors.value.email = 'Email harus diisi'
  } else if (!form.value.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.value.email = 'Format email tidak valid'
  }

  if (!form.value.phone || form.value.phone.trim() === '') {
    errors.value.phone = 'Nomor HP harus diisi'
  } else if (!/^\+[1-9]\d{1,14}$/.test(form.value.phone)) {
    errors.value.phone = 'Format nomor HP tidak valid (contoh: +6282218458888)'
  }

  if (!form.value.birth_date) {
    errors.value.birth_date = 'Tanggal lahir harus diisi'
  }

  if (!form.value.gender) {
    errors.value.gender = 'Jenis kelamin harus dipilih'
  }

  if (!form.value.marital_status) {
    errors.value.marital_status = 'Status kawin harus dipilih'
  }

  if (!form.value.position) {
    errors.value.position = 'Jabatan harus dipilih'
  }

  if (!form.value.department) {
    errors.value.department = 'Departemen harus dipilih'
  }

  if (!form.value.join_date) {
    errors.value.join_date = 'Tanggal masuk harus diisi'
  }

  if (!form.value.type) {
    errors.value.type = 'Tipe kontrak harus dipilih'
  }

  if (!form.value.birth_place_id || form.value.birth_place_id <= 0) {
    errors.value.birthCityName = 'Tempat lahir harus dipilih dari daftar'
  }

  return Object.keys(errors.value).length === 0
}

import { watch } from 'vue'
watch(form, () => {
  if (hasSubmitted.value) {
    validateForm()
  }
}, { deep: true })

const submitForm = () => {
  hasSubmitted.value = true
  if (validateForm()) {
    emit('submit', {
      nip: form.value.nip,
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      birth_date: form.value.birth_date,
      birth_place_id: form.value.birth_place_id,
      gender: form.value.gender,
      marital_status: form.value.marital_status,
      children_count: form.value.children_count,
      position: form.value.position,
      department: form.value.department,
      join_date: form.value.join_date,
      type: form.value.type,
      status: form.value.status,
      district_id: form.value.district_id,
      full_address: form.value.full_address,
      educations: form.value.educations,
      educationIds: selectedEducations.value.map(e => e.id),
    } as any)
  }
}
</script>

<style scoped>
.needs-validation {
  padding: 1.5rem;
}
</style>
    