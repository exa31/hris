<template>
  <div class="space-y-8">
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <ProgressSpinner strokeWidth="4" />
      <p class="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading user data...</p>
    </div>

    <form v-else @submit.prevent="submitForm" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Sidebar / Summary -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Profile Preview Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
            <Avatar 
              :image="selectedEmployeePhoto || getAvatarUrl(form.username || 'U', '6366f1')" 
              shape="circle" 
              class="!w-32 !h-32 border-4 border-white dark:border-slate-800 shadow-lg mb-6" 
            />
            
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {{ form.username || 'New User' }}
            </h3>
            
            <Tag 
              :value="selectedRoleName" 
              class="!rounded-lg !px-3 !py-1 !text-xs !font-bold mb-6" 
              :class="form.role_id === 1 ? '!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600' : '!bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-400'"
            />

            <div class="w-full pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Linked Employee</label>
              <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <i class="bi bi-person-badge text-slate-400 text-lg"></i>
                <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {{ selectedEmployeeName || 'No employee selected' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Status Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <i class="bi bi-shield-check text-indigo-500"></i> Account Status
            </h4>
            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-900 dark:text-white">Active</span>
                <span class="text-xs text-slate-500">Allow system access</span>
              </div>
              <ToggleSwitch v-model="statusBoolean" />
            </div>
          </div>
        </div>

        <!-- Right Form Area -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Account Details -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <i class="bi bi-person-circle text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">Account Details</h3>
                <p class="text-xs font-medium text-slate-500">Basic login information</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Username <span class="text-rose-500">*</span></label>
                <InputText 
                  v-model="form.username" 
                  @input="errors.username = undefined"
                  :class="errors.username ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10' : '!border-slate-200 dark:!border-slate-700'"
                  class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/50 focus:!ring-indigo-500 transition-all" 
                  placeholder="Enter username" 
                />
                <Transition name="p-message-content">
                  <small v-if="errors.username" class="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <i class="bi bi-exclamation-circle"></i> {{ errors.username }}
                  </small>
                </Transition>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Role & Permissions <span class="text-rose-500">*</span></label>
                <Select 
                  v-model="form.role_id" 
                  @change="errors.role_id = undefined"
                  :options="roles" 
                  optionLabel="name" 
                  optionValue="id" 
                  placeholder="Select a role"
                  :disabled="!canManageRoles"
                  :class="errors.role_id ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10' : '!border-slate-200 dark:!border-slate-700'"
                  class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/50 transition-all" 
                />
                <Transition name="p-message-content">
                  <small v-if="errors.role_id" class="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <i class="bi bi-exclamation-circle"></i> {{ errors.role_id }}
                  </small>
                </Transition>
              </div>

              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Password <span v-if="!isEdit" class="text-rose-500">*</span></label>
                <Password 
                  v-model="form.password" 
                  @input="errors.password = undefined"
                  :feedback="false"
                  :toggleMask="true"
                  fluid
                  :inputClass="[
                    '!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/50 focus:!ring-indigo-500 !py-3 !text-sm transition-all',
                    errors.password ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10' : '!border-slate-200 dark:!border-slate-700'
                  ]"
                  :placeholder="isEdit ? 'Leave blank to retain current password' : 'Enter new secure password'" 
                />
                <Transition name="p-message-content">
                  <small v-if="errors.password" class="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <i class="bi bi-exclamation-circle"></i> {{ errors.password }}
                  </small>
                </Transition>
              </div>
            </div>
          </div>

          <!-- Employee Mapping -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <i class="bi bi-link-45deg text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">Profile Link</h3>
                <p class="text-xs font-medium text-slate-500">Connect this account to an employee profile</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Select Employee <span class="text-rose-500">*</span></label>
              <AutoComplete 
                v-model="employeeSearch" 
                :suggestions="filteredEmployees"
                :delay="400"
                @complete="searchEmployee"
                @item-select="onEmployeeSelect"
                optionLabel="name" 
                placeholder="Search and select an employee..." 
                class="!w-full"
                :pt="{
                  pcInputText: {
                    root: {
                      class: [
                        '!w-full !rounded-xl !p-3.5 !bg-slate-50 dark:!bg-slate-800/50 !text-sm font-medium focus:!ring-indigo-500 transition-all',
                        errors.employee_id ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10' : '!border-slate-200 dark:!border-slate-700'
                      ]
                    }
                  }
                }"
              >
                <template #option="slotProps">
                  <div class="flex items-center gap-3">
                    <Avatar :image="slotProps.option.photo_url || getAvatarUrl(slotProps.option.name, 'random')" shape="circle" class="!w-6 !h-6" />
                    <div>
                      <div class="font-bold text-sm">{{ slotProps.option.name }}</div>
                      <div class="text-xs text-slate-500">{{ slotProps.option.nip }}</div>
                    </div>
                  </div>
                </template>
              </AutoComplete>
              <Transition name="p-message-content">
                <small v-if="errors.employee_id" class="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                  <i class="bi bi-exclamation-circle"></i> {{ errors.employee_id }}
                </small>
              </Transition>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center justify-end gap-4 pt-4">
            <Button label="Cancel" severity="secondary" text class="!rounded-xl !px-6 !py-3 !font-bold" @click="$router.back()" />
            <Button type="submit" :label="isEdit ? 'Save Changes' : 'Create User'" :loading="submitting" class="!rounded-xl !px-8 !py-3 !bg-indigo-600 hover:!bg-indigo-700 !border-none !font-bold !shadow-md transition-all" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUsers } from '~/composables/useUsers';

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  canManageRoles: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const { fetchRoles, searchEmployees } = useUsers();

const loading = ref(true);
const submitting = ref(false);

const roles = ref<any[]>([]);
const filteredEmployees = ref<any[]>([]);
const employeeSearch = ref<any>(null);

const form = ref<any>({
  username: '',
  password: '',
  role_id: null,
  employee_id: null,
  is_active: true
});

const errors = ref<any>({
  username: null,
  password: null,
  role_id: null,
  employee_id: null
});

const statusBoolean = computed({
  get: () => form.value.is_active,
  set: (val) => { form.value.is_active = val; }
});

const selectedEmployeeName = computed(() => employeeSearch.value?.name || form.value.employee_name);
const selectedEmployeePhoto = computed(() => employeeSearch.value?.photo_url);
const selectedRoleName = computed(() => roles.value.find(r => r.id === form.value.role_id)?.name || 'Select a role');

const searchEmployee = async (event: any) => {
  if (!event.query.trim().length) {
    filteredEmployees.value = [];
  } else {
    filteredEmployees.value = await searchEmployees(event.query);
  }
};

const onEmployeeSelect = (event: any) => {
  form.value.employee_id = event.value.id;
  // Keep the string representation when selection is done if desired, or object.
  // We'll leave it as the object so AutoComplete displays the name.
};

onMounted(async () => {
  try {
    const rolesData = await fetchRoles();
    roles.value = rolesData;

    if (props.isEdit && props.initialData) {
      form.value = { 
        username: props.initialData.username,
        role_id: props.initialData.role_id,
        employee_id: props.initialData.employee_id,
        is_active: props.initialData.is_active,
        password: ''
      };
      if (props.initialData.employee_id) {
        employeeSearch.value = {
          id: props.initialData.employee_id,
          name: props.initialData.employee_name || 'Linked Employee',
          photo_url: props.initialData.employee_photo_url || null
        };
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

watch(() => props.initialData, (newData) => {
  if (props.isEdit && newData) {
    form.value = { 
      username: newData.username,
      role_id: newData.role_id,
      employee_id: newData.employee_id,
      is_active: newData.is_active,
      password: ''
    };
    if (newData.employee_id) {
      employeeSearch.value = {
        id: newData.employee_id,
        name: newData.employee_name || 'Linked Employee',
        photo_url: newData.employee_photo_url || null
      };
    }
  }
}, { deep: true });

const validateForm = () => {
  let isValid = true;
  errors.value = {
    username: null,
    password: null,
    role_id: null,
    employee_id: null
  };

  if (!form.value.username || form.value.username.trim().length < 6) {
    errors.value.username = 'Username must be at least 6 characters';
    isValid = false;
  }

  if (!form.value.role_id) {
    errors.value.role_id = 'Role is required';
    isValid = false;
  }

  if (!form.value.employee_id) {
    errors.value.employee_id = 'Employee is required';
    isValid = false;
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  if (!props.isEdit) {
    if (!form.value.password || !passwordRegex.test(form.value.password)) {
      errors.value.password = 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character';
      isValid = false;
    }
  } else {
    if (form.value.password && !passwordRegex.test(form.value.password)) {
      errors.value.password = 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character';
      isValid = false;
    }
  }

  return isValid;
};

const submitForm = () => {
  if (!validateForm()) return;
  
  submitting.value = true;
  emit('submit', form.value);
  // submitting will be handled by parent, but we can set timeout to reset just in case
  setTimeout(() => { submitting.value = false; }, 1000);
};
</script>
