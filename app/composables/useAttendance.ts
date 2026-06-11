import { ref, computed } from "vue";
import { getErrorMessageAxios } from "~/utils/handleError";

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  notes: string | null;
  employee_name?: string;
  nip?: number;
  department?: string;
  position?: string;
  created_at: string;
  updated_at: string;
}

export const useAttendance = () => {
  const attendances = ref<AttendanceRecord[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalAttendances = ref(0);
  const searchQuery = ref("");
  const selectedStatus = ref<string>("");
  const selectedMonth = ref<number>(new Date().getMonth() + 1);
  const selectedYear = ref<number>(new Date().getFullYear());
  const $axios = useNuxtApp().$axios;

  const fetchAttendances = async () => {
    try {
      loading.value = true;
      error.value = null;

      const offset = (currentPage.value - 1) * itemsPerPage.value;

      const response = await $axios.get("/api/attendance", {
        params: {
          limit: itemsPerPage.value,
          offset,
          search: searchQuery.value || undefined,
          status: selectedStatus.value || undefined,
          month: selectedMonth.value || undefined,
          year: selectedYear.value || undefined,
        },
      });

      attendances.value = response.data.attendances;
      totalAttendances.value = response.data.pagination.total;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal memuat data absensi";
      console.error("Error fetching attendances:", err);
    } finally {
      loading.value = false;
    }
  };

  const createAttendance = async (data: Partial<AttendanceRecord>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await $axios.post("/api/attendance", data);
      return response.data;
    } catch (err: any) {
      error.value =
        getErrorMessageAxios(err) || "Gagal menambahkan data absensi";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateAttendance = async (
    id: number,
    data: Partial<AttendanceRecord>,
  ) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await $axios.put(`/api/attendance/${id}`, data);
      return response.data;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal mengubah data absensi";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAttendance = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await $axios.delete(`/api/attendance/${id}`);
      attendances.value = attendances.value.filter((a) => a.id !== id);
      return true;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal menghapus data absensi";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSummary = async (month?: number, year?: number) => {
    try {
      loading.value = true;
      const response = await $axios.get("/api/attendance/summary", {
        params: {
          month: month || selectedMonth.value,
          year: year || selectedYear.value,
        },
      });
      return response.data.data;
    } catch (err: any) {
      error.value =
        getErrorMessageAxios(err) || "Gagal memuat ringkasan absensi";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const totalPages = computed(() =>
    Math.ceil(totalAttendances.value / itemsPerPage.value),
  );

  const exportExcel = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await $axios.get("/api/attendance/export-excel", {
        params: {
          search: searchQuery.value || undefined,
          status: selectedStatus.value || undefined,
          month: selectedMonth.value || undefined,
          year: selectedYear.value || undefined,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-presensi.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      error.value =
        getErrorMessageAxios(err) || "Gagal mengekspor data absensi";
      console.error("Error exporting attendances:", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    attendances: readonly(attendances),
    loading: readonly(loading),
    error: readonly(error),
    currentPage,
    itemsPerPage,
    totalAttendances: readonly(totalAttendances),
    searchQuery,
    selectedStatus,
    selectedMonth,
    selectedYear,
    totalPages,
    fetchAttendances,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    fetchSummary,
    exportExcel,
  };
};
