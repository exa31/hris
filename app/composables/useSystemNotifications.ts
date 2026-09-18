import { ref, computed, watch, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";

export interface NotificationItem {
  id: number;
  user_id?: number | null;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: string;
  icon: string;
  link: string;
  read: boolean;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "Recent";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
}

// Global reactive state so badge and popover stay synced across any components
const notifications = ref<NotificationItem[]>([]);
const loading = ref(false);
const backendUnreadCount = ref(0);

export const useSystemNotifications = () => {
  const { user, hasPermission } = useAuth();
  const { $axios } = useNuxtApp();

  const fetchNotifications = async () => {
    // If not authenticated yet, do not fetch
    if (!user.value && !useCookie("access_token").value) return;

    try {
      loading.value = true;
      const defaultAnnouncementLink = hasPermission("announcements", "read")
        ? "/announcements"
        : "/employee/announcements";

      const response = await $axios.get("/api/notifications");
      const resData = response.data?.data || response.data || {};
      const rawList = resData.notifications || [];
      backendUnreadCount.value = Number(resData.unread_count) || 0;

      notifications.value = rawList.map((item: any) => {
        let link = item.link || defaultAnnouncementLink;
        if (item.type === "announcement" || item.type === "broadcast") {
          link = defaultAnnouncementLink;
        }

        return {
          id: Number(item.id),
          user_id: item.user_id,
          title: item.title,
          message: item.message,
          time: item.created_at ? formatRelativeTime(item.created_at) : "Recent",
          timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
          type: item.type || "broadcast",
          icon: item.icon || "bi bi-bell-fill",
          link,
          read: Boolean(item.is_read),
        };
      });
    } catch (err: any) {
      console.error("Error fetching system notifications from database:", err);
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id: number) => {
    const item = notifications.value.find((n) => n.id === id);
    if (item && !item.read) {
      // Optimistic update
      item.read = true;
      if (backendUnreadCount.value > 0) {
        backendUnreadCount.value--;
      }
    }

    try {
      await $axios.patch(`/api/notifications/${id}/read`);
    } catch (err: any) {
      console.error(`Failed to mark notification ${id} as read on server:`, err);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    notifications.value.forEach((n) => {
      n.read = true;
    });
    backendUnreadCount.value = 0;

    try {
      await $axios.post("/api/notifications/read-all");
    } catch (err: any) {
      console.error("Failed to mark all notifications as read on server:", err);
      // Refetch to sync state
      await fetchNotifications();
    }
  };

  const unreadCount = computed(() => {
    return backendUnreadCount.value;
  });

  const hasUnread = computed(() => {
    return unreadCount.value > 0;
  });

  // Re-fetch notifications when authenticated user changes
  watch(
    () => user.value?.id,
    (newId, oldId) => {
      if (newId && newId !== oldId) {
        fetchNotifications();
      }
    },
  );

  return {
    notifications,
    loading,
    unreadCount,
    hasUnread,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
