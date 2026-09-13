<template>
  <div class="relative">
    <button
      type="button"
      v-tooltip.bottom="'Notification Center'"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-xs border border-slate-200/60 dark:border-slate-800/60 relative group cursor-pointer"
      aria-label="Notifications"
      @click="toggleNotifications"
    >
      <i class="bi bi-bell text-base transition-transform duration-300 group-hover:rotate-12"></i>
      <span
        v-if="hasUnread"
        class="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"
      ></span>
    </button>

    <Popover
      ref="popoverRef"
      class="!rounded-2xl !p-0 !shadow-2xl !border !border-slate-200 dark:!border-slate-800 !bg-white dark:!bg-slate-900 overflow-hidden w-[360px] max-w-[90vw]"
    >
      <!-- Header -->
      <div class="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">
            <i class="bi bi-bell-fill"></i>
          </div>
          <div>
            <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Notifications
            </h4>
            <p class="text-[10px] text-slate-400">System updates & broadcasts</p>
          </div>
        </div>

        <button
          v-if="notifications.length > 0"
          type="button"
          class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          @click="markAllRead"
        >
          Mark all read
        </button>
      </div>

      <!-- Notification List -->
      <div class="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
        <div
          v-if="loading"
          class="p-8 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2"
        >
          <i class="bi bi-arrow-clockwise animate-spin text-lg text-indigo-500"></i>
          <span>Loading notifications...</span>
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="p-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2"
        >
          <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xl">
            <i class="bi bi-bell-slash"></i>
          </div>
          <span class="text-xs font-bold text-slate-600 dark:text-slate-300">No new notifications</span>
          <span class="text-[10px]">All system updates and announcements will appear here.</span>
        </div>

        <div
          v-for="item in notifications"
          :key="item.id"
          class="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 group"
          @click="handleNotificationClick(item)"
        >
          <div
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5',
              item.type === 'broadcast'
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            ]"
          >
            <i :class="item.icon"></i>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ item.title }}
              </span>
              <span class="text-[9px] text-slate-400 flex-shrink-0 font-medium">
                {{ item.time }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
              {{ item.message }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Link -->
      <div class="p-2.5 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
        <NuxtLink
          to="/announcements"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 py-1 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          @click="popoverRef?.hide()"
        >
          <span>View All Announcements</span>
          <i class="bi bi-arrow-right text-[10px]"></i>
        </NuxtLink>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const popoverRef = ref<any>(null);
const loading = ref(false);
const hasUnread = ref(true);

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "broadcast" | "system";
  icon: string;
  link?: string;
}

const notifications = ref<NotificationItem[]>([
  {
    id: "1",
    title: "Hybrid Work Schedule",
    message: "The monthly hybrid schedule has been updated in the portal.",
    time: "Just now",
    type: "broadcast",
    icon: "bi bi-megaphone-fill",
    link: "/announcements",
  },
  {
    id: "2",
    title: "Attendance Check-In Active",
    message: "Remember to clock in before the morning threshold of 08:30 AM.",
    time: "Today",
    type: "system",
    icon: "bi bi-calendar-check-fill",
    link: "/attendance",
  },
]);

const toggleNotifications = (event: Event) => {
  popoverRef.value?.toggle(event);
};

const markAllRead = () => {
  hasUnread.value = false;
};

const handleNotificationClick = (item: NotificationItem) => {
  hasUnread.value = false;
  popoverRef.value?.hide();
  if (item.link) {
    router.push(item.link);
  }
};
</script>
