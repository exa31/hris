<template>
  <div v-if="employee" class="max-w-[1400px] mx-auto space-y-10">
    <!-- Sophisticated Header -->
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-100 dark:border-slate-800"
    >
      <div
        class="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left"
      >
        <Motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :animate="{ opacity: 1, scale: 1 }"
          class="relative"
        >
          <div
            class="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"
          ></div>
          <Avatar
            :image="
              employee.photo_url ||
              'https://ui-avatars.com/api/?name=' +
                employee.name +
                '&background=random&size=200'
            "
            shape="circle"
            class="!w-44 !h-44 shadow-2xl ring-4 ring-white dark:ring-slate-900 relative z-10 transition-transform hover:scale-105 duration-500"
          />
          <div
            v-if="employee.status"
            class="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg dark:shadow-none z-20 animate-pulse"
          ></div>
        </Motion>

        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 }"
          class="space-y-4"
        >
          <div class="space-y-1">
            <div
              class="flex flex-wrap items-center justify-center md:justify-start gap-3"
            >
              <h1
                class="text-4xl font-black text-slate-800 dark:text-white tracking-tight"
              >
                {{ employee.name }}
              </h1>
              <div
                class="px-3 py-1 bg-indigo-600 rounded-lg text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                {{ employee.nip }}
              </div>
            </div>
            <p
              class="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]"
            >
              {{ employee.position_name || "N/A" }} &bull;
              {{ employee.department_name || "N/A" }}
            </p>
          </div>

          <div
            class="flex flex-wrap items-center justify-center md:justify-start gap-4"
          >
            <div
              class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold"
            >
              <i class="bi bi-envelope-fill text-indigo-500"></i>
              {{ employee.email }}
            </div>
            <div
              class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold"
            >
              <i class="bi bi-telephone-fill text-emerald-500"></i>
              {{ employee.phone }}
            </div>
          </div>
        </Motion>
      </div>

      <Motion
        :initial="{ opacity: 0, x: 20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: 0.3 }"
        class="flex items-center gap-3"
      >
        <NuxtLink
          v-if="hasPermission('employees', 'update')"
          :to="`/employees/${employee.id}/edit`"
        >
          <Button
            label="Edit Profile"
            icon="bi bi-pencil-square"
            class="!rounded-xl !px-6 !py-3 !bg-slate-900 dark:!bg-indigo-600 !text-white !border-none !font-black !uppercase !text-[10px] !tracking-widest !shadow-xl shadow-slate-200 dark:shadow-none hover:!bg-slate-800 dark:hover:!bg-indigo-500 transition-colors"
          />
        </NuxtLink>
        <Button
          v-if="hasPermission('employees', 'delete')"
          icon="bi bi-trash3"
          severity="danger"
          text
          class="!rounded-xl !bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 !w-12 !h-12 flex items-center justify-center transition-all hover:!bg-rose-600 hover:!text-white"
          @click="deleteThisEmployee($event)"
        />
        <NuxtLink to="/employees">
          <Button
            icon="bi bi-arrow-left"
            severity="secondary"
            text
            class="!rounded-xl !bg-white dark:!bg-slate-900 !border !border-slate-100 dark:!border-slate-800 !w-12 !h-12"
            v-tooltip.top="'Back to Directory'"
          />
        </NuxtLink>
      </Motion>
    </div>

    <!-- Main Profile Content -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left: Detailed Bio -->
      <div class="lg:col-span-8 space-y-8">
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4 }"
          class="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-12"
        >
          <!-- Section: Personal Dossier -->
          <section class="space-y-8">
            <div class="flex items-center gap-4">
              <div class="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              <h3
                class="text-lg font-black text-slate-800 dark:text-white tracking-tight uppercase tracking-widest text-[11px]"
              >
                Identity Dossier
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
              <div
                v-for="(val, label) in personalInfo"
                :key="label"
                class="space-y-2"
              >
                <div
                  class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                >
                  {{ label }}
                </div>
                <div
                  class="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <i
                    v-if="val.icon"
                    :class="val.icon"
                    class="text-indigo-500"
                  ></i>
                  {{ val.text }}
                </div>
              </div>
              <div class="md:col-span-2 space-y-2">
                <div
                  class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                >
                  Registered Address
                </div>
                <div
                  class="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800"
                >
                  {{ employee.full_address || "No registered address on file" }}
                  <div
                    v-if="employee.districtName"
                    class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500"
                  >
                    {{ employee.districtName }}, {{ employee.regencyName }},
                    {{ employee.provinceName }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section: Academic Milestones -->
          <section v-if="employee.educations?.length" class="space-y-8">
            <div class="flex items-center gap-4">
              <div class="w-1.5 h-6 bg-amber-500 rounded-full"></div>
              <h3
                class="text-lg font-black text-slate-800 dark:text-white tracking-tight uppercase tracking-widest text-[11px]"
              >
                Academic Foundations
              </h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="edu in employee.educations"
                :key="edu.id"
                class="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-amber-200 transition-colors"
              >
                <div
                  class="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform"
                >
                  <i class="bi bi-mortarboard-fill text-xl"></i>
                </div>
                <div>
                  <div
                    class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >
                    Academic Credential
                  </div>
                  <div
                    class="text-sm font-black text-slate-700 dark:text-slate-300 mt-1"
                  >
                    {{ edu.name }}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Motion>
      </div>

      <!-- Right: Contract & Professional -->
      <div class="lg:col-span-4 space-y-8">
        <Motion
          :initial="{ opacity: 0, x: 20 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ delay: 0.5 }"
          class="bg-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-indigo-900 to-indigo-950 opacity-100"
          ></div>
          <div
            class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"
          ></div>

          <div class="relative z-10 space-y-8">
            <div class="flex items-center justify-between">
              <h4
                class="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]"
              >
                Contract Protocol
              </h4>
              <i class="bi bi-shield-check text-indigo-400"></i>
            </div>

            <div class="space-y-6">
              <div
                v-for="stat in contractStats"
                :key="stat.label"
                class="flex items-center gap-4 group/stat"
              >
                <div
                  class="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xl transition-transform group-hover/stat:scale-110"
                >
                  <i :class="stat.icon"></i>
                </div>
                <div>
                  <div
                    class="text-[9px] font-bold text-indigo-300/60 uppercase tracking-widest"
                  >
                    {{ stat.label }}
                  </div>
                  <div class="text-lg font-black tracking-tight">
                    {{ stat.value }}
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-8 border-t border-white/10 space-y-4">
              <div
                v-for="val in ['DIVISI', 'LEVEL']"
                :key="val"
                class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <span
                  class="text-[9px] font-black text-indigo-300 uppercase tracking-widest"
                  >{{ val }}</span
                >
                <span class="text-xs font-black">{{
                  val === "DIVISI"
                    ? employee.department_name
                    : employee.position_name
                }}</span>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Profile QR Card -->
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.6 }"
          class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-6"
        >
          <div
            class="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 group cursor-pointer"
          >
            <i
              class="bi bi-qr-code text-4xl text-emerald-500 group-hover:scale-110 transition-transform block"
            ></i>
          </div>
          <div class="space-y-2">
            <h4
              class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight"
            >
              Digital Talent Key
            </h4>
            <p
              class="text-[9px] font-bold text-slate-400 uppercase leading-relaxed max-w-[200px]"
            >
              Authentication token for biometric & check-in terminals
            </p>
          </div>
          <Button
            label="Generate Badge"
            icon="bi bi-download"
            severity="secondary"
            text
            class="!rounded-xl !px-6 !py-2.5 !text-[9px] !font-black !uppercase !tracking-widest !bg-slate-50 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors"
          />
        </Motion>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="flex flex-col items-center justify-center py-40 space-y-4">
    <div
      class="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-800"
    >
      <i class="bi bi-person-x text-5xl"></i>
    </div>
    <div class="text-center">
      <h3 class="text-xl font-black text-slate-800 dark:text-white">
        Talent Not Found
      </h3>
      <p class="text-sm text-slate-400 font-medium">
        The requested talent matrix does not exist or has been purged.
      </p>
    </div>
    <NuxtLink to="/employees">
      <Button
        label="Back to Directory"
        severity="secondary"
        text
        class="!rounded-xl !font-black !uppercase !text-[10px] !bg-slate-50 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors"
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useEmployees } from "~/composables/useEmployees";
import { useAuth } from "~/composables/useAuth";
import { useConfirm } from "primevue/useconfirm";

const { hasPermission } = useAuth();
const confirm = useConfirm();
const route = useRoute();
const router = useRouter();

const employeeId = computed(() => parseInt(route.params.id as string));
const employee = ref<any>(null);
const loading = ref(true);

const formatDate = (date: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateAge = (birthDate: string, joinDate: string) => {
  if (!birthDate || !joinDate) return "-";
  const birth = new Date(birthDate);
  const join = new Date(joinDate);
  let age = join.getFullYear() - birth.getFullYear();
  if (
    join.getMonth() < birth.getMonth() ||
    (join.getMonth() === birth.getMonth() && join.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age > 0 ? age : 0;
};

const personalInfo = computed(() => ({
  "Place of Birth": {
    text: employee.value.birthCityName || "-",
    icon: "bi bi-geo-fill",
  },
  "Birth Matrix": {
    text: `${formatDate(employee.value.birth_date)} (${calculateAge(employee.value.birth_date, employee.value.join_date)} Yrs)`,
    icon: "bi bi-calendar-check",
  },
  "Gender Identity": { text: employee.value.gender, icon: "bi bi-person-fill" },
  "Marital Status": {
    text: `${employee.value.marital_status} (${employee.value.children_count} Dependents)`,
    icon: "bi bi-people-fill",
  },
  "Jarak Rumah ke Kantor": {
    text:
      employee.value.distance_km !== null &&
      employee.value.distance_km !== undefined
        ? `${employee.value.distance_km} KM`
        : "0 KM",
    icon: "bi bi-signpost-split-fill",
  },
}));

const contractStats = computed(() => [
  {
    label: "Induction Date",
    value: formatDate(employee.value.join_date),
    icon: "bi bi-calendar-event",
  },
  {
    label: "Contract Type",
    value: employee.value.type,
    icon: "bi bi-file-earmark-lock",
  },
]);

const deleteThisEmployee = (event: Event) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message:
      "Are you sure you want to permanently purge this profile from the system? All history will be lost.",
    header: "Terminate Talent Record",
    icon: "bi bi-exclamation-triangle text-rose-500",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
      size: "small",
      class: "!rounded-lg !px-4",
    },
    acceptProps: {
      label: "Purge",
      severity: "danger",
      size: "small",
      class: "!rounded-lg !px-4",
    },
    accept: async () => {
      await useEmployees().deleteEmployee(employeeId.value);
      router.push("/employees");
    },
  });
};

onMounted(async () => {
  try {
    employee.value = await useEmployees().getEmployee(employeeId.value);
  } catch (error) {
    console.error("Failed to load employee:", error);
  } finally {
    loading.value = false;
  }
});

definePageMeta({ layout: "default" });
</script>
