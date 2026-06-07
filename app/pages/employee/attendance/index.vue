<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Presensi Kehadiran
        </h2>
        <p
          class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1"
        >
          Catat dan pantau kehadiran Anda
        </p>
      </div>
    </div>

    <!-- Clock In/Out Section -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      class="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden"
    >
      <div
        class="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"
      ></div>

      <div class="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div class="flex items-center gap-6">
          <div
            class="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 text-3xl shadow-inner border border-indigo-100 dark:border-indigo-500/20"
          >
            <i class="bi bi-clock-history"></i>
          </div>
          <div>
            <div class="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">
              {{ currentTime }}
            </div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              {{ currentDate }}
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <Button
            v-if="!hasClockedIn"
            label="Clock In"
            icon="bi bi-box-arrow-in-right"
            class="!px-8 !py-4 !rounded-2xl !font-black !text-sm !tracking-widest !bg-emerald-500 !border-none shadow-lg shadow-emerald-500/30 dark:shadow-none hover:!scale-105 transition-transform"
            @click="handleClock('in')"
            :loading="actionLoading"
          />
          <Button
            v-else-if="!hasClockedOut"
            label="Clock Out"
            icon="bi bi-box-arrow-right"
            class="!px-8 !py-4 !rounded-2xl !font-black !text-sm !tracking-widest !bg-amber-500 !border-none shadow-lg shadow-amber-500/30 dark:shadow-none hover:!scale-105 transition-transform"
            @click="handleClock('out')"
            :loading="actionLoading"
          />
          <div
            v-else
            class="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 font-black text-sm tracking-widest flex items-center gap-3"
          >
            <i class="bi bi-check-circle-fill text-emerald-500"></i> Absensi Hari Ini Selesai
          </div>
        </div>
      </div>
    </Motion>

    <!-- History Table -->
    <Motion
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.1 }"
      class="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
    >
      <div class="p-6 border-b border-slate-50 dark:border-slate-700">
        <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight">
          Riwayat Presensi
        </h3>
      </div>

      <DataTable :value="attendances" :loading="loading" class="p-datatable-dashboard-overhaul">
        <Column field="date" header="Tanggal">
          <template #body="slotProps">
            <div class="font-bold text-slate-800 dark:text-white">
              {{ formatDate(slotProps.data.date) }}
            </div>
          </template>
        </Column>
        <Column header="Status">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.status"
              class="!rounded-xl !px-3 !py-1.5 !text-[10px] !font-black !uppercase !tracking-widest"
              :class="{
                '!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400':
                  slotProps.data.status === 'Hadir',
                '!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400':
                  slotProps.data.status === 'Terlambat',
                '!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400':
                  slotProps.data.status === 'Alpa',
                '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400':
                  slotProps.data.status === 'Izin' || slotProps.data.status === 'Cuti',
              }"
            />
          </template>
        </Column>
        <Column field="clock_in" header="Clock In">
          <template #body="slotProps">
            <div class="text-slate-500 dark:text-slate-400 font-medium">
              {{ slotProps.data.clock_in ? formatTime(slotProps.data.clock_in) : '-' }}
            </div>
          </template>
        </Column>
        <Column field="clock_out" header="Clock Out">
          <template #body="slotProps">
            <div class="text-slate-500 dark:text-slate-400 font-medium">
              {{ slotProps.data.clock_out ? formatTime(slotProps.data.clock_out) : '-' }}
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-12">
            <i class="bi bi-inbox text-4xl text-slate-300 dark:text-slate-500 mb-4"></i>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Belum ada riwayat absensi.</p>
          </div>
        </template>
      </DataTable>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

definePageMeta({ layout: 'default' });

const loading = ref(false);
const actionLoading = ref(false);
const attendances = ref<any[]>([]);

const hasClockedIn = ref(false);
const hasClockedOut = ref(false);

const currentTime = ref('');
const currentDate = ref('');
let timer: any;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  currentDate.value = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const fetchHistory = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>('/api/employee/attendance');
    attendances.value = res.data.attendances || [];

    // Check today's status
    const today = attendances.value.find((a: any) => {
      const aDate = new Date(a.date).toDateString();
      const tDate = new Date().toDateString();
      return aDate === tDate;
    });

    if (today) {
      hasClockedIn.value = !!today.clock_in;
      hasClockedOut.value = !!today.clock_out;
    }
  } catch (error) {
    console.error('Failed to load history', error);
  } finally {
    loading.value = false;
  }
};

const handleClock = async (type: 'in' | 'out') => {
  actionLoading.value = true;
  try {
    await $fetch('/api/employee/attendance/clock', {
      method: 'POST',
      body: { type },
    });

    useNotificationStore().showSuccess('Berhasil', `Berhasil Clock ${type.toUpperCase()}`);
    await fetchHistory();
  } catch (error) {
    console.error('Clock action failed', error);
    useNotificationStore().showError('Gagal', `Gagal Clock ${type.toUpperCase()}`);
  } finally {
    actionLoading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  // Check if it's full datetime or just time
  if (timeStr.includes('T')) {
    return new Date(timeStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  // Remove seconds from HH:MM:SS
  return timeStr.substring(0, 5);
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
  fetchHistory();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>
