<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
      <Motion :initial="{ opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }" class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span class="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Internal Communications
          </span>
        </div>
        <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Team Broadcasts & Announcements
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Official communications, operational policies, and corporate notices.
        </p>
      </Motion>

      <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }">
        <div class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs text-xs font-bold text-slate-500 dark:text-slate-400">
          <i class="bi bi-broadcast text-indigo-500 text-sm animate-pulse"></i>
          <span>{{ announcements.length }} Active Broadcasts</span>
        </div>
      </Motion>
    </div>

    <!-- Search and Priority Filter Bar -->
    <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.15 }">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div class="relative flex-1 min-w-[260px] max-w-md group">
          <i class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
          <InputText
            v-model="searchQuery"
            placeholder="Search title or announcement content..."
            class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800/60 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-slate-200 focus:!ring-2 focus:!ring-indigo-500/20"
          />
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-for="cat in ['All', 'High Priority', 'General']"
            :key="cat"
            type="button"
            @click="selectedCategory = cat"
            class="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            :class="[
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </Motion>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-64 rounded-3xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredAnnouncements.length === 0"
      class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center px-6"
    >
      <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-3xl text-indigo-500 mb-3 shadow-inner">
        <i class="bi bi-megaphone-fill"></i>
      </div>
      <h3 class="text-base font-black text-slate-800 dark:text-white mb-1">
        No Announcements Found
      </h3>
      <p class="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm mb-4">
        {{ searchQuery ? 'No news articles match your search criteria.' : 'No new corporate announcements have been published yet.' }}
      </p>
      <Button
        v-if="searchQuery"
        label="Clear Search Filter"
        icon="bi bi-x-circle"
        class="!rounded-xl !px-5 !py-2.5 !bg-indigo-600 !border-none !text-[10px] !font-black !uppercase !tracking-widest"
        @click="searchQuery = ''; selectedCategory = 'All'"
      />
    </div>

    <!-- Content Grid -->
    <div v-else class="space-y-6">
      <!-- Featured / Top Announcement Card if available -->
      <Motion
        v-if="featuredAnnouncement"
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        class="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden group cursor-pointer"
        @click="openDetail(featuredAnnouncement)"
      >
        <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="space-y-3 max-w-2xl">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-lg bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <i class="bi bi-star-fill text-[8px]"></i>
                Featured Notice
              </span>
              <span class="text-xs text-indigo-200/80 font-medium">
                {{ formatDate(featuredAnnouncement.created_at) }}
              </span>
            </div>
            <h2 class="text-2xl font-black tracking-tight leading-snug group-hover:text-indigo-300 transition-colors">
              {{ featuredAnnouncement.title }}
            </h2>
            <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {{ featuredAnnouncement.content }}
            </p>
          </div>

          <div class="shrink-0 flex items-center gap-3">
            <Button
              label="Read Full Notice"
              icon="bi bi-arrow-right"
              iconPos="right"
              class="!rounded-xl !px-6 !py-3 !font-black !uppercase !text-[10px] !tracking-widest !bg-white !text-indigo-900 hover:!bg-indigo-50 !border-none shadow-lg shadow-black/20"
            />
          </div>
        </div>
      </Motion>

      <!-- Standard Announcement Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Motion
          v-for="(ann, idx) in regularAnnouncements"
          :key="ann.id"
          :initial="{ opacity: 0, y: 15 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: idx * 0.06 }"
          class="h-full flex flex-col"
        >
          <div
            class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col h-full justify-between"
            @click="openDetail(ann)"
          >
            <div class="flex flex-col flex-grow">
              <div class="flex items-center justify-between mb-4">
                <span class="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20">
                  {{ ann.priority || 'General' }}
                </span>
                <span class="text-[10px] font-bold text-slate-400">
                  {{ formatDate(ann.created_at) }}
                </span>
              </div>

              <h3 class="text-base font-black text-slate-800 dark:text-white leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 min-h-[2.75rem]">
                {{ ann.title }}
              </h3>

              <p class="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 flex-grow leading-relaxed">
                {{ ann.content }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <div class="flex items-center gap-2">
                <Avatar
                  :image="ann.author?.photo_url || getAvatarUrl(ann.author?.name || 'HR', '6366f1')"
                  shape="circle"
                  class="!w-7 !h-7"
                />
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                  {{ ann.author?.name || 'HR Management' }}
                </span>
              </div>
              <span class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Read</span>
                <i class="bi bi-chevron-right text-[10px]"></i>
              </span>
            </div>
          </div>
        </Motion>
      </div>
    </div>

    <!-- Announcement Reading Detail Dialog -->
    <Dialog
      v-model:visible="detailVisible"
      modal
      class="w-full max-w-2xl"
      :pt="{
        root: { class: '!rounded-3xl !border !border-slate-100 dark:!border-slate-800 !bg-white dark:!bg-slate-900 !shadow-2xl overflow-hidden' },
        header: { class: 'px-8 pt-8 pb-4 !bg-transparent !border-b !border-slate-100 dark:!border-slate-800 !text-slate-800 dark:text-white' },
        content: { class: 'px-8 py-6 !bg-transparent' },
        footer: { class: 'px-8 pb-8 pt-2 !bg-transparent !border-none' },
      }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
            <i class="bi bi-megaphone-fill"></i>
          </div>
          <div>
            <span class="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Official Broadcast Details
            </span>
            <h3 class="text-base font-black text-slate-800 dark:text-white tracking-tight leading-tight">
              {{ selectedAnnouncement?.title }}
            </h3>
          </div>
        </div>
      </template>

      <div v-if="selectedAnnouncement" class="space-y-6">
        <!-- Meta info strip -->
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <Avatar
              :image="selectedAnnouncement.author?.photo_url || getAvatarUrl(selectedAnnouncement.author?.name || 'HR', '6366f1')"
              shape="circle"
              class="!w-9 !h-9"
            />
            <div>
              <div class="text-xs font-black text-slate-800 dark:text-slate-200">
                {{ selectedAnnouncement.author?.name || 'HR Management' }}
              </div>
              <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                HR & Internal Relations
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-xs font-bold text-slate-600 dark:text-slate-300">
              {{ formatDate(selectedAnnouncement.created_at) }}
            </div>
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Release Time
            </div>
          </div>
        </div>

        <!-- Full announcement body -->
        <div class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line px-1">
          {{ selectedAnnouncement.content }}
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3 pt-2">
          <Button
            label="Close Window"
            severity="secondary"
            text
            @click="detailVisible = false"
            class="!rounded-xl !px-6 !py-2.5 !font-bold !text-xs"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

definePageMeta({ layout: 'default' });

const loading = ref(false);
const announcements = ref<any[]>([]);
const detailVisible = ref(false);
const selectedAnnouncement = ref<any>(null);
const searchQuery = ref('');
const selectedCategory = ref('All');

const openDetail = (announcement: any) => {
  selectedAnnouncement.value = announcement;
  detailVisible.value = true;
};

const debouncedSearchQuery = useDebouncedRef(searchQuery, 300);

const filteredAnnouncements = computed(() => {
  return announcements.value.filter((ann) => {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    const matchQuery =
      !query ||
      ann.title?.toLowerCase().includes(query) ||
      ann.content?.toLowerCase().includes(query);

    let matchCat = true;
    if (selectedCategory.value === 'High Priority') {
      matchCat = ann.priority?.toLowerCase() === 'high' || ann.priority?.toLowerCase() === 'urgent';
    } else if (selectedCategory.value === 'General') {
      matchCat = ann.priority?.toLowerCase() !== 'high' && ann.priority?.toLowerCase() !== 'urgent';
    }

    return matchQuery && matchCat;
  });
});

const featuredAnnouncement = computed(() => {
  if (filteredAnnouncements.value.length === 0) return null;
  return filteredAnnouncements.value[0];
});

const regularAnnouncements = computed(() => {
  if (filteredAnnouncements.value.length <= 1) return [];
  return filteredAnnouncements.value.slice(1);
});

const { $axios } = useNuxtApp();

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const res = await $axios.get('/api/employee/announcements');
    announcements.value = res.data?.announcements || res.data?.data?.announcements || [];
  } catch (error) {
    console.error('Failed to fetch announcements', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr.replace(' ', 'T') + 'Z');
  return date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

onMounted(() => {
  fetchAnnouncements();
});
</script>
