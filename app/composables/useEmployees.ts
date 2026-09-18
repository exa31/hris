import { ref, computed } from "vue";
import { getErrorMessageAxios } from "~/utils/handleError";

export interface Employee {
  id: number;
  nip: number;
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  birth_place_id: number;
  birthCityName?: string;
  role_name?: string;
  marital_status: string;
  gender: string;
  children_count: number;
  join_date: string;
  position_id: number;
  department_id: number;
  position_name?: string;
  department_name?: string;
  status: boolean;
  type: string;

  district_id?: number;
  districtName?: string;
  regencyName?: string;
  provinceName?: string;
  full_address?: string;
  educations?: any[];
  created_at: string;
  updated_at: string;
  photo_url?: string | null;
  user_id?: number | null;
  username?: string | null;
  role_id?: number | null;
  user_is_active?: boolean | null;
}

export const useEmployees = () => {
  const employees = ref<Employee[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalEmployees = ref(0);
  const searchQuery = ref("");
  const selectedDepartment = ref<number | null>(null);
  const selectedStatus = ref<boolean | null>(null);
  const selectedType = ref<string>("All Types");
  const selectedRole = ref<number | null>(null);
  const selectedPositions = ref<number[]>([]);
  const selectedEmployees = ref<number[]>([]);

  const $axios = useNuxtApp().$axios;

  const summary = ref({
    total_talent: 0,
    active_crew: 0,
    new_talent: 0,
    on_leave: 0,
  });

  const metadata = ref<{
    departments: {
      id: number;
      name: string;
    }[];
    positions: {
      id: number;
      name: string;
    }[];
    roles: {
      id: number;
      name: string;
    }[];
  }>({
    departments: [],
    positions: [],
    roles: [],
  });

  const sortColumn = ref<string>("join_date");
  const sortDirection = ref<"asc" | "desc">("desc");
  const tenureOperator = ref<string>(">");
  const tenureValue = ref<number | null>(null);

  // Fetch summary stats
  const fetchSummary = async () => {
    try {
      const response = await $axios.get("/api/employees/summary");
      summary.value = response.data;
    } catch (err: any) {
      console.error("Error fetching employee summary:", err);
    }
  };

  // Fetch metadata (departments, positions, and roles)
  const fetchMetadata = async () => {
    try {
      const [deptRes, posRes, roleRes] = await Promise.all([
        $axios.get("/api/departments"),
        $axios.get("/api/positions"),
        $axios.get("/api/roles"),
      ]);
      metadata.value = {
        departments: deptRes.data,
        positions: posRes.data,
        roles: roleRes.data,
      };
    } catch (err: any) {
      console.error("Error fetching metadata:", err);
    }
  };

  // Fetch employees from API

  const fetchEmployees = async () => {
    try {
      loading.value = true;
      error.value = null;

      const offset = (currentPage.value - 1) * itemsPerPage.value;

      const response = await $axios.get("/api/employees", {
        params: {
          limit: itemsPerPage.value,
          offset,
          search: searchQuery.value || undefined,
          department_id: selectedDepartment.value || undefined,
          status:
            selectedStatus.value !== null ? selectedStatus.value : undefined,
          sortColumn: sortColumn.value || undefined,
          sortDirection: sortDirection.value || undefined,
          position_ids:
            selectedPositions.value.length > 0
              ? selectedPositions.value.join(",")
              : undefined,
          tenureOperator: tenureOperator.value || undefined,
          tenureValue:
            tenureValue.value !== null ? tenureValue.value : undefined,
          type:
            selectedType.value !== "All Types" ? selectedType.value : undefined,
          role_id: selectedRole.value || undefined,
        },
      });

      employees.value = response.data.employees;
      totalEmployees.value = response.data.pagination.total;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Failed to fetch employees";
      console.error("Error fetching employees:", err);
    } finally {
      loading.value = false;
    }
  };

  // Get single employee
  const getEmployee = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await $axios.get(`/api/employees/${id}`);
      return response.data;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Failed to fetch employee";
      console.error("Error fetching employee:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Create employee
  const addEmployee = async (
    data: Omit<Employee, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await $axios.post("/api/employees", data);
      employees.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Failed to create employee";
      console.error("Error creating employee:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update employee
  const updateEmployee = async (
    id: number,
    data: Partial<Omit<Employee, "id" | "created_at" | "updated_at">>,
  ) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await $axios.put(`/api/employees/${id}`, data);

      const index = employees.value.findIndex((emp) => emp.id === id);
      if (index !== -1) {
        employees.value[index] = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Failed to update employee";
      console.error("Error updating employee:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete employee
  const deleteEmployee = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;

      await $axios.delete(`/api/employees/${id}`);

      employees.value = employees.value.filter((emp) => emp.id !== id);
      selectedEmployees.value = selectedEmployees.value.filter(
        (empId) => empId !== id,
      );
      return true;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Failed to delete employee";
      console.error("Error deleting employee:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Bulk delete employees
  const deleteSelectedEmployees = async () => {
    if (selectedEmployees.value.length === 0) return;

    try {
      loading.value = true;
      error.value = null;

      await $axios.post("/api/employees/bulk-delete", {
        ids: selectedEmployees.value,
      });

      employees.value = employees.value.filter(
        (emp) => !selectedEmployees.value.includes(emp.id),
      );
      selectedEmployees.value = [];
      return true;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Failed to delete employees";
      console.error("Error deleting employees:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Bulk update status
  const updateStatusBulk = async (status: boolean) => {
    if (selectedEmployees.value.length === 0) return;

    try {
      loading.value = true;
      error.value = null;

      await $axios.post("/api/employees/bulk-status", {
        ids: selectedEmployees.value,
        status,
      });

      selectedEmployees.value.forEach((id) => {
        const emp = employees.value.find((e) => e.id === id);
        if (emp) emp.status = status;
      });

      selectedEmployees.value = [];
      return true;
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Failed to update status";
      console.error("Error updating status:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const selectableEmployees = employees.value.filter(
      (emp) => emp.role_name?.toLowerCase().replace(/\s/g, "") !== "superadmin",
    );

    if (
      selectedEmployees.value.length === selectableEmployees.length &&
      selectableEmployees.length > 0
    ) {
      selectedEmployees.value = [];
    } else {
      selectedEmployees.value = selectableEmployees.map((emp) => emp.id);
    }
  };

  // Reset filters
  const resetFilters = () => {
    searchQuery.value = "";
    selectedDepartment.value = null;
    selectedStatus.value = null;
    selectedPositions.value = [];
    selectedRole.value = null;
    tenureOperator.value = ">";
    tenureValue.value = null;
    currentPage.value = 1;
  };

  const exportExcel = async () => {
    try {
      loading.value = true;
      const { $axios } = useNuxtApp();
      
      const response = await $axios.get("/api/employees/export-excel", {
        params: {
          search: searchQuery.value || undefined,
          department_id: selectedDepartment.value || undefined,
          status: selectedStatus.value !== null ? selectedStatus.value : undefined,
          sortColumn: sortColumn.value || undefined,
          sortDirection: sortDirection.value || undefined,
          positions: selectedPositions.value.length > 0 ? selectedPositions.value.join(",") : undefined,
          tenureOperator: tenureOperator.value || undefined,
          tenureValue: tenureValue.value !== null ? tenureValue.value : undefined,
          type: selectedType.value !== "All Types" ? selectedType.value : undefined,
          role_id: selectedRole.value || undefined,
        },
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employee-directory.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      error.value = getErrorMessageAxios(err) || "Failed to export data";
      console.error("Export Error:", err);
    } finally {
      loading.value = false;
    }
  };

  // Pagination computed
  const totalPages = computed(() =>
    Math.ceil(totalEmployees.value / itemsPerPage.value),
  );

  return {
    // State
    employees: readonly(employees),
    loading: readonly(loading),
    error: readonly(error),
    currentPage,
    itemsPerPage,
    totalEmployees: readonly(totalEmployees),
    searchQuery,
    selectedDepartment,
    selectedStatus,
    selectedType,
    selectedRole,
    selectedEmployees,

    sortColumn,
    sortDirection,
    selectedPositions,
    tenureOperator,
    tenureValue,
    // Computed
    totalPages,
    // Methods
    fetchEmployees,
    getEmployee,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    deleteSelectedEmployees,
    updateStatusBulk,
    toggleSelectAll,
    resetFilters,
    exportExcel,
    summary: readonly(summary),
    fetchSummary,
    metadata: metadata,
    fetchMetadata,
  };
};
