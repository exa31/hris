import { ref, computed } from "vue";
import { getErrorMessageAxios } from "~/utils/handleError";

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
  approved_by: number | null;
  rejection_reason: string | null;
  employee_name?: string;
  nip?: number;
  department?: string;
  leave_type_name?: string;
  max_days?: number;
  approved_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveType {
  id: number;
  name: string;
  max_days: number;
  description: string | null;
}

export const useLeaveRequests = () => {
  const leaveRequests = ref<LeaveRequest[]>([]);
  const leaveTypes = ref<LeaveType[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalRequests = ref(0);
  const searchQuery = ref("");
  const selectedStatus = ref<string>("");
  const selectedLeaveType = ref<number | null>(null);
  const $axios = useNuxtApp().$axios;

  const fetchLeaveRequests = async () => {
    try {
      loading.value = true;
      error.value = null;

      const offset = (currentPage.value - 1) * itemsPerPage.value;

      const response = await $axios.get("/api/leaves", {
        params: {
          limit: itemsPerPage.value,
          offset,
          search: searchQuery.value || undefined,
          status: selectedStatus.value || undefined,
          leave_type_id: selectedLeaveType.value || undefined,
        },
      });

      leaveRequests.value = response.data.leaveRequests;
      totalRequests.value = response.data.pagination.total;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal memuat data cuti";
      console.error("Error fetching leave requests:", err);
    } finally {
      loading.value = false;
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await $axios.get("/api/leaves/types");
      leaveTypes.value = response.data;
    } catch (err: any) {
      console.error("Error fetching leave types:", err);
    }
  };

  const createLeaveRequest = async (data: Partial<LeaveRequest>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await $axios.post("/api/leaves", data);
      return response.data;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Gagal mengajukan cuti";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveLeaveRequest = async (
    id: number,
    status: string,
    rejectionReason?: string,
  ) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await $axios.put(`/api/leaves/${id}`, {
        status,
        rejection_reason: rejectionReason || null,
      });
      return response.data;
    } catch (err: any) {
      error.value =
        getErrorMessageAxios(err) || "Gagal memproses pengajuan cuti";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteLeaveRequest = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await $axios.delete(`/api/leaves/${id}`);
      leaveRequests.value = leaveRequests.value.filter((r) => r.id !== id);
      return true;
    } catch (err: any) {
      error.value =
        getErrorMessageAxios(err) || "Gagal menghapus pengajuan cuti";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await $axios.get("/api/leaves/summary", {
        params: {
          search: searchQuery.value || undefined,
          status: selectedStatus.value || undefined,
          leave_type_id: selectedLeaveType.value || undefined,
        },
      });
      return response.data.data;
    } catch (err: any) {
      console.error("Error fetching leave summary:", err);
      return { pending: 0, approved: 0, rejected: 0 };
    }
  };

  const totalPages = computed(() =>
    Math.ceil(totalRequests.value / itemsPerPage.value),
  );

  return {
    leaveRequests: readonly(leaveRequests),
    leaveTypes: readonly(leaveTypes),
    loading: readonly(loading),
    error: readonly(error),
    currentPage,
    itemsPerPage,
    totalRequests: readonly(totalRequests),
    searchQuery,
    selectedStatus,
    selectedLeaveType,
    totalPages,
    fetchLeaveRequests,
    fetchLeaveTypes,
    createLeaveRequest,
    approveLeaveRequest,
    deleteLeaveRequest,
    fetchSummary,
  };
};
