<template>
  <form @submit.prevent="submitForm">
    <div class="row">
      <!-- Foto Pegawai -->
      <div class="col-md-4 mb-3">
        <label class="form-label">Foto Pegawai</label>
        <div class="upload-area border-2 border-dashed rounded p-4 text-center">
          <div v-if="!previewImage" class="upload-placeholder">
            <i class="bi bi-cloud-upload text-muted" style="font-size: 2rem"></i>
            <p class="text-muted small mt-2">Upload file PNG/JPEG/JPG</p>
          </div>
          <img v-else :src="previewImage" class="img-fluid rounded" style="max-height: 200px" />
          <input
            type="file"
            class="form-control mt-2"
            accept=".png,.jpg,.jpeg"
            @change="handleFotoChange"
          />
          <small class="text-muted d-block mt-2">Format: PNG, JPEG, JPG (Maks 5MB)</small>
        </div>
      </div>

      <!-- Right Column - Form Fields -->
      <div class="col-md-8">
        <!-- NIP -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">NIP <span class="text-danger">*</span></label>
            <input
              v-model="form.nip"
              type="text"
              class="form-control"
              placeholder="Minimal 8 karakter angka"
              :class="{ 'is-invalid': errors.nip }"
            />
            <small v-if="errors.nip" class="text-danger d-block mt-1">{{ errors.nip }}</small>
          </div>

          <!-- Nama Pegawai -->
          <div class="col-md-6">
            <label class="form-label">Nama Pegawai <span class="text-danger">*</span></label>
            <input
              v-model="form.nama"
              type="text"
              class="form-control"
              placeholder="Nama lengkap"
              :class="{ 'is-invalid': errors.nama }"
            />
            <small v-if="errors.nama" class="text-danger d-block mt-1">{{ errors.nama }}</small>
          </div>
        </div>

        <!-- Email & No HP -->
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
              v-model="form.noHp"
              type="tel"
              class="form-control"
              placeholder="+6282218458888"
              :class="{ 'is-invalid': errors.noHp }"
            />
            <small v-if="errors.noHp" class="text-danger d-block mt-1">{{ errors.noHp }}</small>
            <small class="text-muted d-block mt-1">Format: +62xxxxxxxxxx</small>
          </div>
        </div>

        <!-- Status Aktif -->
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">Status <span class="text-danger">*</span></label>
            <div class="form-check">
              <input
                id="statusAktif"
                v-model="form.statusAktif"
                type="checkbox"
                class="form-check-input"
              />
              <label class="form-check-label" for="statusAktif">
                Aktif
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-4" />

    <!-- Alamat Section -->
    <h5 class="mb-3">Alamat</h5>
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Kecamatan <span class="text-danger">*</span></label>
        <input
          v-model="form.alamatKecamatan"
          type="text"
          class="form-control"
          placeholder="Masukkan minimal 3 karakter"
          :class="{ 'is-invalid': errors.alamatKecamatan }"
        />
        <small v-if="errors.alamatKecamatan" class="text-danger d-block mt-1">{{ errors.alamatKecamatan }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Kabupaten <span class="text-danger">*</span></label>
        <input
          v-model="form.alamatKabupaten"
          type="text"
          class="form-control"
          disabled
          placeholder="Auto terisi"
        />
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Provinsi <span class="text-danger">*</span></label>
        <input
          v-model="form.alamatProvinsi"
          type="text"
          class="form-control"
          disabled
          placeholder="Auto terisi"
        />
      </div>

      <div class="col-md-6">
        <label class="form-label">Tempat Lahir <span class="text-danger">*</span></label>
        <input
          v-model="form.tempatLahir"
          type="text"
          class="form-control"
          placeholder="Pilih kabupaten"
          :class="{ 'is-invalid': errors.tempatLahir }"
        />
        <small v-if="errors.tempatLahir" class="text-danger d-block mt-1">{{ errors.tempatLahir }}</small>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-12">
        <label class="form-label">Alamat Lengkap <span class="text-danger">*</span></label>
        <textarea
          v-model="form.alamatLengkap"
          class="form-control"
          rows="3"
          placeholder="Jalan, no rumah, RT/RW, dll"
          :class="{ 'is-invalid': errors.alamatLengkap }"
        ></textarea>
        <small v-if="errors.alamatLengkap" class="text-danger d-block mt-1">{{ errors.alamatLengkap }}</small>
      </div>
    </div>

    <hr class="my-4" />

    <!-- Data Pribadi Section -->
    <h5 class="mb-3">Data Pribadi</h5>
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Tanggal Lahir <span class="text-danger">*</span></label>
        <input
          v-model="form.tanggalLahir"
          type="date"
          class="form-control"
          :class="{ 'is-invalid': errors.tanggalLahir }"
        />
        <small v-if="errors.tanggalLahir" class="text-danger d-block mt-1">{{ errors.tanggalLahir }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Usia (Otomatis)</label>
        <input
          v-model="form.usia"
          type="number"
          class="form-control"
          disabled
        />
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Status Kawin <span class="text-danger">*</span></label>
        <div>
          <div class="form-check">
            <input
              id="statusKawin"
              v-model="form.statusKawin"
              type="radio"
              value="kawin"
              class="form-check-input"
            />
            <label class="form-check-label" for="statusKawin">Kawin</label>
          </div>
          <div class="form-check">
            <input
              id="statusTidakKawin"
              v-model="form.statusKawin"
              type="radio"
              value="tidak kawin"
              class="form-check-input"
            />
            <label class="form-check-label" for="statusTidakKawin">Tidak Kawin</label>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <label class="form-label">Jumlah Anak <span class="text-danger">*</span></label>
        <input
          v-model.number="form.jumlahAnak"
          type="number"
          class="form-control"
          min="0"
          max="99"
          placeholder="0"
          :class="{ 'is-invalid': errors.jumlahAnak }"
        />
        <small v-if="errors.jumlahAnak" class="text-danger d-block mt-1">{{ errors.jumlahAnak }}</small>
      </div>
    </div>

    <hr class="my-4" />

    <!-- Dara Kerja Section -->
    <h5 class="mb-3">Data Kerja</h5>
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Tanggal Masuk <span class="text-danger">*</span></label>
        <input
          v-model="form.tanggalMasuk"
          type="date"
          class="form-control"
          @change="calculateMasaKerja"
          :class="{ 'is-invalid': errors.tanggalMasuk }"
        />
        <small v-if="errors.tanggalMasuk" class="text-danger d-block mt-1">{{ errors.tanggalMasuk }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Masa Kerja (Otomatis)</label>
        <input
          v-model="form.masaKerja"
          type="number"
          class="form-control"
          disabled
        />
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Jabatan <span class="text-danger">*</span></label>
        <select v-model="form.jabatan" class="form-select" :class="{ 'is-invalid': errors.jabatan }">
          <option value="">-- Pilih Jabatan --</option>
          <option value="Manager">Manager</option>
          <option value="Staf">Staf</option>
          <option value="Magang">Magang</option>
        </select>
        <small v-if="errors.jabatan" class="text-danger d-block mt-1">{{ errors.jabatan }}</small>
      </div>

      <div class="col-md-6">
        <label class="form-label">Departemen <span class="text-danger">*</span></label>
        <select v-model="form.departemen" class="form-select" :class="{ 'is-invalid': errors.departemen }">
          <option value="">-- Pilih Departemen --</option>
          <option value="Marketing">Marketing</option>
          <option value="HRD">HRD</option>
          <option value="Production">Production</option>
          <option value="Executive">Executive</option>
          <option value="Commissioner">Commissioner</option>
        </select>
        <small v-if="errors.departemen" class="text-danger d-block mt-1">{{ errors.departemen }}</small>
      </div>
    </div>

    <hr class="my-4" />

    <!-- Pendidikan Section -->
    <div class="mb-3">
      <label class="form-label">Pendidikan <span class="text-danger">*</span></label>
      
      <!-- Add Education Form -->
      <div class="d-flex gap-2 mb-3">
        <input
          v-model="newEducationName"
          type="text"
          class="form-control"
          placeholder="Contoh: S1 / Sarjana, SMA, SMK, dll"
          @keyup.enter="addEducation"
        />
        <button
          type="button"
          class="btn btn-outline-primary flex-shrink-0"
          @click="addEducation"
        >
          <i class="bi bi-plus-lg"></i> Tambah
        </button>
      </div>

      <!-- Pendidikan Checklist -->
      <div v-if="form.pendidikan.length > 0" class="border rounded p-3">
        <div
          v-for="(pendidikan, idx) in form.pendidikan"
          :key="idx"
          class="d-flex gap-2 align-items-center mb-2 pb-2"
          :class="{ 'border-bottom': idx < form.pendidikan.length - 1 }"
        >
          <!-- Checkbox -->
          <input
            v-model="pendidikan.selected"
            type="checkbox"
            class="form-check-input"
            style="margin-top: 0"
          />

          <!-- Education Name -->
          <span class="flex-grow-1">
            {{ allEducations.find(e => e.id === pendidikan.educationId)?.name || `Education #${pendidikan.educationId}` }}
          </span>

          <!-- Delete Button -->
          <button
            type="button"
            class="btn btn-sm btn-outline-danger flex-shrink-0"
            @click="removeEducationField(idx)"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="alert alert-light text-center py-2 mb-0">
        <small class="text-muted">Belum ada pendidikan. Ketik nama di atas dan klik Tambah.</small>
      </div>
    </div>

    <!-- Pendidikan Error Message -->
    <small v-if="errors.pendidikan" class="text-danger d-block mt-1">{{ errors.pendidikan }}</small>

    <hr class="my-4" />

    <!-- Submit Buttons -->
    <div class="d-flex gap-2">
      <button type="submit" class="btn btn-primary">
        <i class="bi bi-check-lg"></i> {{ isEdit ? 'Update' : 'Simpan' }}
      </button>
      <NuxtLink to="/employees" class="btn btn-outline-secondary">
        <i class="bi bi-x-lg"></i> Batal
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Employee } from '~/composables/useEmployees'
import { useEducations, type Education } from '~/composables/useEducations'

const props = withDefaults(
  defineProps<{
    initialData?: Partial<Employee>
    isEdit?: boolean
  }>(),
  {
    isEdit: false
  }
)

const emit = defineEmits<{
  submit: [data: Omit<Employee, 'id'>]
}>()

const previewImage = ref<string>('')
const errors = ref<Record<string, string>>({})
const newEducationName = ref<string>('')
const { getEducations, createEducation } = useEducations()
const allEducations = ref<Education[]>([])

onMounted(async () => {
  allEducations.value = await getEducations()
})

// Helper function to normalize pendidikan data
const normalizePendidikan = (data: any) => {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.map((item: any) => {
      if (typeof item === 'number') {
        return { educationId: item, selected: false }
      }
      if (typeof item === 'object' && item.educationId) {
        return { ...item, selected: item.selected ?? false }
      }
      return item
    })
  }
  return []
}
const form = ref({
  nip: props.initialData?.nip || '',
  nama: props.initialData?.nama || '',
  email: props.initialData?.email || '',
  noHp: props.initialData?.noHp || '',
  tempatLahir: props.initialData?.tempatLahir || '',
  alamatKecamatan: props.initialData?.alamatKecamatan || '',
  alamatKabupaten: props.initialData?.alamatKabupaten || '',
  alamatProvinsi: props.initialData?.alamatProvinsi || '',
  alamatLengkap: props.initialData?.alamatLengkap || '',
  tanggalLahir: props.initialData?.tanggalLahir || '',
  statusKawin: props.initialData?.statusKawin || 'tidak kawin',
  jumlahAnak: props.initialData?.jumlahAnak || 0,
  tanggalMasuk: props.initialData?.tanggalMasuk || '',
  masaKerja: props.initialData?.masaKerja || 0,
  jabatan: props.initialData?.jabatan || '',
  departemen: props.initialData?.departemen || '',
  usia: props.initialData?.usia || 0,
  pendidikan: normalizePendidikan(props.initialData?.pendidikan),
  statusAktif: props.initialData?.statusAktif ?? true
})

const handleFotoChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const calculateMasaKerja = () => {
  if (!form.value.tanggalMasuk) return
  const joinDate = new Date(form.value.tanggalMasuk)
  const today = new Date()
  form.value.masaKerja = today.getFullYear() - joinDate.getFullYear()

  // Hitung usia jika ada tanggal lahir
  if (form.value.tanggalLahir) {
    const birthDate = new Date(form.value.tanggalLahir)
    form.value.usia = today.getFullYear() - birthDate.getFullYear()
  }
}

const addEducationField = () => {
  form.value.pendidikan.push({
    educationId: 0,
    selected: false
  })
}

const addEducation = async () => {
  if (!newEducationName.value.trim()) {
    alert('Masukkan nama pendidikan')
    return
  }

  // Create new education
  const newEducation = await createEducation(newEducationName.value.trim())
  
  // Add to form pendidikan
  form.value.pendidikan.push({
    educationId: newEducation.id,
    selected: true
  })

  // Reset input
  newEducationName.value = ''
}

const removeEducationField = (index: number) => {
  form.value.pendidikan.splice(index, 1)
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.nip) {
    errors.value.nip = 'NIP harus diisi'
  } else if (form.value.nip.length < 8 || !/^\d+$/.test(form.value.nip)) {
    errors.value.nip = 'NIP minimal 8 karakter angka'
  }

  if (!form.value.nama) {
    errors.value.nama = 'Nama harus diisi'
  }

  if (!form.value.email) {
    errors.value.email = 'Email harus diisi'
  } else if (!form.value.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.value.email = 'Format email tidak valid'
  }

  if (!form.value.noHp) {
    errors.value.noHp = 'Nomor HP harus diisi'
  }

  if (!form.value.jabatan) {
    errors.value.jabatan = 'Jabatan harus dipilih'
  }

  if (!form.value.departemen) {
    errors.value.departemen = 'Departemen harus dipilih'
  }

  if (!form.value.tanggalMasuk) {
    errors.value.tanggalMasuk = 'Tanggal masuk harus diisi'
  }

  if (!form.value.tempatLahir) {
    errors.value.tempatLahir = 'Tempat lahir harus diisi'
  }

  if (!form.value.tanggalLahir) {
    errors.value.tanggalLahir = 'Tanggal lahir harus diisi'
  }

  if (!form.value.alamatKecamatan) {
    errors.value.alamatKecamatan = 'Kecamatan harus diisi'
  }

  if (!form.value.alamatLengkap) {
    errors.value.alamatLengkap = 'Alamat lengkap harus diisi'
  }

  if (form.value.jumlahAnak < 0) {
    errors.value.jumlahAnak = 'Jumlah anak tidak valid'
  }

  if (form.value.pendidikan.length === 0) {
    errors.value.pendidikan = 'Minimal satu pendidikan harus dipilih'
  } else if (form.value.pendidikan.some(p => !p.educationId || p.educationId === 0)) {
    errors.value.pendidikan = 'Semua pendidikan harus dipilih'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = () => {
  if (validateForm()) {
    emit('submit', {
      nip: form.value.nip,
      nama: form.value.nama,
      email: form.value.email,
      noHp: form.value.noHp,
      tempatLahir: form.value.tempatLahir,
      alamatKecamatan: form.value.alamatKecamatan,
      alamatKabupaten: form.value.alamatKabupaten,
      alamatProvinsi: form.value.alamatProvinsi,
      alamatLengkap: form.value.alamatLengkap,
      tanggalLahir: form.value.tanggalLahir,
      statusKawin: form.value.statusKawin,
      jumlahAnak: form.value.jumlahAnak,
      tanggalMasuk: form.value.tanggalMasuk,
      masaKerja: form.value.masaKerja,
      jabatan: form.value.jabatan,
      departemen: form.value.departemen,
      usia: form.value.usia,
      pendidikan: form.value.pendidikan,
      statusAktif: form.value.statusAktif
    })
  }
}
</script>

<style scoped>
.upload-area {
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  background: #f0f4f8;
  border-color: #667eea !important;
}

.upload-placeholder {
  padding: 2rem 0;
}

.card {
  border: 1px solid #e2e8f0;
}
</style>
