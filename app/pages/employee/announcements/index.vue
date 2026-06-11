<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Pengumuman</h2>
        <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Pusat informasi dan pengumuman perusahaan</p>
      </div>
    </div>

    <!-- Announcements List -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="i in 4" :key="i" class="h-40 rounded-3xl bg-white dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700 shadow-sm"></div>
    </div>
    
    <div v-else-if="announcements.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
      <i class="bi bi-megaphone text-6xl text-slate-300 dark:text-slate-500 mb-6"></i>
      <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Tidak Ada Pengumuman</h3>
      <p class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Belum ada informasi terbaru untuk saat ini.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Motion
        v-for="(announcement, idx) in announcements"
        :key="announcement.id"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.1 }"
      >
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all"></div>
          
          <div class="relative z-10 flex flex-col h-full">
            <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                Informasi
              </span>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {{ formatDate(announcement.created_at) }}
              </span>
            </div>
            
            <h3 class="text-lg font-black text-slate-800 dark:text-white leading-tight mb-3">
              {{ announcement.title }}
            </h3>
            
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 flex-grow">
              {{ announcement.content }}
            </p>
            
            <div class="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
              <Avatar 
                :image="announcement.author?.photo_url || `https://ui-avatars.com/api/?name=${announcement.author?.name || 'Admin'}&background=random`" 
                shape="circle" 
                class="!w-8 !h-8"
              />
              <div>
                <div class="text-xs font-black text-slate-800 dark:text-white">{{ announcement.author?.name || 'HRD' }}</div>
                <div class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Penulis</div>
              </div>
            </div>
          </div>
        </div>
      </Motion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({ layout: 'default' });

const loading = ref(false);
const announcements = ref<any[]>([]);

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const res = await $fetch<any>('/api/employee/announcements');
    announcements.value = res.data.announcements || [];
  } catch (error) {
    console.error('Failed to fetch announcements', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr.replace(' ', 'T') + 'Z');
  return date.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(() => {
  fetchAnnouncements();
});
</script>
