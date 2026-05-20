import { ref, computed } from "vue";
import { getErrorMessageAxios } from "~/utils/handleError";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  target_department: string | null;
  is_active: boolean;
  created_by: number;
  created_by_name?: string;
  creator_name?: string;
  created_at: string;
  updated_at: string;
}

export const useAnnouncements = () => {
  const announcements = ref<Announcement[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalAnnouncements = ref(0);
  const searchQuery = ref("");
  const selectedPriority = ref<string>("");
  const $axios = useNuxtApp().$axios;

  const fetchAnnouncements = async () => {
    try {
      loading.value = true;
      error.value = null;

      const offset = (currentPage.value - 1) * itemsPerPage.value;

      const response = await $axios.get("/api/announcements", {
        params: {
          limit: itemsPerPage.value,
          offset,
          search: searchQuery.value || undefined,
          priority: selectedPriority.value || undefined,
        },
      });

      announcements.value = response.data.announcements;
      totalAnnouncements.value = response.data.pagination.total;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal memuat pengumuman";
      console.error("Error fetching announcements:", err);
    } finally {
      loading.value = false;
    }
  };

  const createAnnouncement = async (data: Partial<Announcement>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await $axios.post("/api/announcements", data);
      return response.data;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal membuat pengumuman";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateAnnouncement = async (
    id: number,
    data: Partial<Announcement>,
  ) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await $axios.put(`/api/announcements/${id}`, data);
      return response.data;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal mengubah pengumuman";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAnnouncement = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await $axios.delete(`/api/announcements/${id}`);
      announcements.value = announcements.value.filter((a) => a.id !== id);
      return true;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal menghapus pengumuman";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const totalPages = computed(() =>
    Math.ceil(totalAnnouncements.value / itemsPerPage.value),
  );

  return {
    announcements: readonly(announcements),
    loading: readonly(loading),
    error: readonly(error),
    currentPage,
    itemsPerPage,
    totalAnnouncements: readonly(totalAnnouncements),
    searchQuery,
    selectedPriority,
    totalPages,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
};
