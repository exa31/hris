<template>
  <div class="relative">
    <button
      type="button"
      v-tooltip.bottom="hasUnread ? `Notification Center (${unreadCount} unread)` : 'Notification Center'"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-xs border border-slate-200/60 dark:border-slate-800/60 relative group cursor-pointer"
      aria-label="Notifications"
      @click="toggleNotifications"
    >
      <i class="bi bi-bell text-base transition-transform duration-300 group-hover:rotate-12"></i>
      <span
        v-if="hasUnread"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-[9px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Popover
      ref="popoverRef"
      class="!rounded-2xl !p-0 !shadow-2xl !border !border-slate-200 dark:!border-slate-800 !bg-white dark:!bg-slate-900 overflow-hidden w-[380px] max-w-[92vw]"
    >
      <!-- Header -->
      <div class="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">
            <i class="bi bi-bell-fill"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Notifications
              </h4>
              <span
                v-if="unreadCount > 0"
                class="px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-black"
              >
                {{ unreadCount }} new
              </span>
            </div>
            <p class="text-[10px] text-slate-400">System updates & broadcasts</p>
          </div>
        </div>

        <button
          v-if="unreadCount > 0"
          type="button"
          class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
          @click="handleMarkAllRead"
        >
          <i class="bi bi-check2-all text-xs"></i>
          <span>Mark all read</span>
        </button>
      </div>

      <!-- Notification List -->
      <div class="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
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
          class="p-3.5 transition-colors cursor-pointer flex gap-3 group relative"
          :class="[
            item.read
              ? 'opacity-75 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
          ]"
          @click="handleNotificationClick(item)"
        >
          <!-- Unread indicator bar on left -->
          <div
            v-if="!item.read"
            class="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-r"
          ></div>

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
              <span
                class="text-xs truncate transition-colors"
                :class="item.read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'"
              >
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

          <!-- Quick Mark as Read Icon Button -->
          <button
            v-if="!item.read"
            type="button"
            class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs self-center"
            title="Mark as read"
            @click.stop="handleMarkSingleRead(item)"
          >
            <i class="bi bi-check2"></i>
          </button>
        </div>
      </div>

      <!-- Footer Link -->
      <div class="p-2.5 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
        <NuxtLink
          :to="announcementLink"
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSystemNotifications, type NotificationItem } from "~/composables/useSystemNotifications";
import { useAuth } from "~/composables/useAuth";

const router = useRouter();
const { hasPermission } = useAuth();
const popoverRef = ref<any>(null);

const {
  notifications,
  loading,
  unreadCount,
  hasUnread,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} = useSystemNotifications();

const announcementLink = computed(() => {
  return hasPermission("announcements", "read") ? "/announcements" : "/employee/announcements";
});

onMounted(() => {
  fetchNotifications();
});

const toggleNotifications = (event: Event) => {
  popoverRef.value?.toggle(event);
  fetchNotifications();
};

const handleMarkAllRead = () => {
  markAllAsRead();
};

const handleMarkSingleRead = (item: NotificationItem) => {
  markAsRead(item.id);
};

const handleNotificationClick = (item: NotificationItem) => {
  markAsRead(item.id);
  popoverRef.value?.hide();
  if (item.link) {
    router.push(item.link);
  }
};
</script>
