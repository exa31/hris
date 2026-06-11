<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Pengajuan Cuti</h2>
        <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Kelola dan ajukan permohonan cuti Anda</p>
      </div>
      <Button 
        label="Ajukan Cuti Baru" 
        icon="bi bi-plus-lg" 
        @click="showRequestModal = true; errors = {}"
        class="!rounded-xl !px-6 !py-3 !font-black !text-xs !tracking-widest !bg-indigo-600 hover:!bg-indigo-700 !border-none shadow-lg shadow-indigo-500/30 dark:shadow-none transition-transform hover:scale-105"
      />
    </div>

    <!-- History Table -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
    >
      <div class="p-6 border-b border-slate-50 dark:border-slate-700">
        <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight">Riwayat Pengajuan</h3>
      </div>
      
      <DataTable :value="leaves" :loading="loading" class="p-datatable-dashboard-overhaul" :pt="{ wrapper: { class: '!bg-transparent' } }">
        <Column field="type" header="Tipe Cuti">
          <template #body="slotProps">
            <div class="font-bold text-slate-800 dark:text-white">{{ slotProps.data.type }}</div>
          </template>
        </Column>
        <Column header="Tanggal Cuti">
          <template #body="slotProps">
            <div class="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {{ formatDate(slotProps.data.start_date) }} - {{ formatDate(slotProps.data.end_date) }}
            </div>
          </template>
        </Column>
        <Column field="reason" header="Alasan">
          <template #body="slotProps">
            <div class="text-slate-500 dark:text-slate-400 max-w-[200px] truncate" :title="slotProps.data.reason">
              {{ slotProps.data.reason }}
            </div>
          </template>
        </Column>
        <Column header="Status">
          <template #body="slotProps">
            <Tag 
              :value="slotProps.data.status" 
              class="!rounded-xl !px-3 !py-1.5 !text-[10px] !font-black !uppercase !tracking-widest"
              :class="{
                '!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400': slotProps.data.status === 'Pending',
                '!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400': slotProps.data.status === 'Approved',
                '!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400': slotProps.data.status === 'Rejected',
              }"
            />
          </template>
        </Column>
        
        <template #empty>
          <div class="flex flex-col items-center justify-center py-12">
            <i class="bi bi-inbox text-4xl text-slate-300 dark:text-slate-500 mb-4"></i>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Belum ada riwayat pengajuan cuti.</p>
          </div>
        </template>
      </DataTable>
    </Motion>

    <!-- Request Modal -->
    <Dialog 
      v-model:visible="showRequestModal" 
      modal 
      header="Formulir Pengajuan Cuti" 
      :style="{ width: '50vw' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      class="p-dialog-dashboard"
    >
      <form @submit.prevent="submitRequest" class="space-y-6 pt-4">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tipe Cuti <span class="text-rose-500 ml-0.5">*</span></label>
          <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
            :class="{ 'border-rose-200 ring-4 ring-rose-500/5': errors.type }"
          >
            <i class="bi bi-calendar3 text-slate-300"></i>
            <Dropdown 
              v-model="form.type" 
              :options="leaveTypes" 
              placeholder="Pilih Tipe Cuti" 
              class="!flex-1 !bg-transparent !border-none !p-0"
              :class="{ 'p-invalid': errors.type }"
            />
          </div>
          <small
            v-if="errors.type"
            class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
          >
            <i class="bi bi-exclamation-circle"></i> {{ errors.type }}
          </small>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tanggal Mulai <span class="text-rose-500 ml-0.5">*</span></label>
            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
              :class="{ 'border-rose-200 ring-4 ring-rose-500/5': errors.start_date }"
            >
              <i class="bi bi-calendar-event text-slate-300"></i>
              <Calendar 
                v-model="form.start_date" 
                dateFormat="dd/mm/yy"
                placeholder="Pilih Tanggal Mulai"
                class="!flex-1"
                :class="{ 'p-invalid': errors.start_date }"
                inputClass="!bg-transparent !border-none !p-0 !text-xs !font-bold !w-full dark:!text-slate-300"
              />
            </div>
            <small
              v-if="errors.start_date"
              class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
            >
              <i class="bi bi-exclamation-circle"></i> {{ errors.start_date }}
            </small>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tanggal Selesai <span class="text-rose-500 ml-0.5">*</span></label>
            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
              :class="{ 'border-rose-200 ring-4 ring-rose-500/5': errors.end_date }"
            >
              <i class="bi bi-calendar-check text-slate-300"></i>
              <Calendar 
                v-model="form.end_date" 
                dateFormat="dd/mm/yy"
                :minDate="form.start_date"
                placeholder="Pilih Tanggal Selesai"
                class="!flex-1"
                :class="{ 'p-invalid': errors.end_date }"
                inputClass="!bg-transparent !border-none !p-0 !text-xs !font-bold !w-full dark:!text-slate-300"
              />
            </div>
            <small
              v-if="errors.end_date"
              class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
            >
              <i class="bi bi-exclamation-circle"></i> {{ errors.end_date }}
            </small>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Alasan <span class="text-rose-500 ml-0.5">*</span></label>
          <div class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors"
            :class="{ 'border-rose-200 ring-4 ring-rose-500/5': errors.reason }"
          >
            <i class="bi bi-chat-quote mt-2 text-slate-300"></i>
            <Textarea 
              v-model="form.reason" 
              rows="4" 
              placeholder="Jelaskan alasan cuti Anda secara singkat..."
              class="!bg-transparent !border-none !p-0 !text-xs !font-bold !w-full dark:!text-slate-300 resize-none"
              :class="{ 'p-invalid': errors.reason }"
            ></Textarea>
          </div>
          <small
            v-if="errors.reason"
            class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
          >
            <i class="bi bi-exclamation-circle"></i> {{ errors.reason }}
          </small>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button 
            type="button" 
            label="Batal" 
            severity="secondary" 
            text 
            @click="showRequestModal = false"
            class="!rounded-xl !px-6 !py-3 !font-black"
          />
          <Button 
            type="submit" 
            label="Kirim Pengajuan" 
            :loading="submitting"
            class="!rounded-xl !px-6 !py-3 !bg-indigo-600 hover:!bg-indigo-700 !border-none !font-black !text-xs !tracking-widest shadow-lg dark:shadow-none"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({ layout: 'default' });

const loading = ref(false);
const submitting = ref(false);
const showRequestModal = ref(false);
const leaves = ref<any[]>([]);

const leaveTypes = ['Tahunan', 'Sakit', 'Melahirkan', 'Penting', 'Lainnya'];

const errors = ref<any>({});

const form = ref({
  type: '',
  start_date: null,
  end_date: null,
  reason: ''
});

const validateForm = () => {
  errors.value = {};
  if (!form.value.type) errors.value.type = 'Tipe cuti harus dipilih';
  if (!form.value.start_date) errors.value.start_date = 'Tanggal mulai harus diisi';
  if (!form.value.end_date) errors.value.end_date = 'Tanggal selesai harus diisi';
  if (form.value.start_date && form.value.end_date && form.value.end_date < form.value.start_date) {
    errors.value.end_date = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
  }
  if (!form.value.reason || form.value.reason.length < 5) {
    errors.value.reason = 'Alasan harus diisi (min 5 karakter)';
  }
  return Object.keys(errors.value).length === 0;
};

const fetchLeaves = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>('/api/employee/leaves');
    leaves.value = res.data.leaves || [];
  } catch (error) {
    console.error('Failed to fetch leaves', error);
  } finally {
    loading.value = false;
  }
};

const submitRequest = async () => {
  if (!validateForm()) return;

  submitting.value = true;
  try {
    await $fetch('/api/employee/leaves', {
      method: 'POST',
      body: {
        type: form.value.type,
        start_date: form.value.start_date,
        end_date: form.value.end_date,
        reason: form.value.reason
      }
    });
    
    useNotificationStore().showSuccess('Berhasil', 'Pengajuan cuti berhasil dikirim');
    showRequestModal.value = false;
    
    // Reset form
    form.value = {
      type: '',
      start_date: null,
      end_date: null,
      reason: ''
    };
    
    await fetchLeaves();
  } catch (error) {
    console.error('Failed to submit leave', error);
    useNotificationStore().showError('Gagal', 'Terjadi kesalahan saat mengirim pengajuan');
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(() => {
  fetchLeaves();
});
</script>

<style>
.p-dialog-dashboard .p-dialog-header {
  @apply bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white font-black tracking-tight rounded-t-2xl;
}
.p-dialog-dashboard .p-dialog-content {
  @apply bg-white dark:bg-slate-950 p-6;
}
</style>
