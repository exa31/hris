<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800"
    >
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="space-y-2"
      >
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"
          ></span>
          <span
            class="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400"
            >Settings</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Allowance Configuration
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Configure core parameters for transport allowance calculation.
        </p>
      </Motion>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Settings Form -->
      <Motion
        class="lg:col-span-7"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.2 }"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 h-full"
        >
          <div class="flex items-center gap-4 mb-2">
            <div
              class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"
            >
              <i class="bi bi-sliders"></i>
            </div>
            <h3
              class="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight"
            >
              Rate Parameters
            </h3>
          </div>

          <!-- Base Fare -->
          <div class="space-y-3">
            <label
              class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Base Fare (Rate per km)</label
            >
            <div class="relative group">
              <span
                class="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-indigo-600 dark:text-indigo-400 group-focus-within:scale-110 transition-transform z-10"
                >Rp</span
              >
              <InputNumber
                v-model="localSettings.base_fare"
                @update:model-value="baseFareError = null"
                placeholder="Enter rate amount..."
                class="w-full"
                :inputClass="[
                  '!pl-16 !py-5 !rounded-2xl !text-2xl !font-black !text-slate-700 dark:!text-white focus:!bg-white dark:focus:!bg-slate-900 focus:!ring-4 focus:!ring-indigo-500/10 transition-all',
                  baseFareError
                    ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-50/10'
                    : '!bg-slate-50 dark:!bg-slate-800 !border-slate-100 dark:!border-slate-700'
                ]"
                :disabled="
                  !hasPermission('transport_setting', 'update') || saving
                "
              />
            </div>
            <small
              v-if="baseFareError"
              class="text-rose-500 text-xs font-bold ml-1 flex items-center gap-1"
            >
              <i class="bi bi-exclamation-circle"></i> {{ baseFareError }}
            </small>
            <p
              v-else
              class="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase tracking-tighter italic"
            >
              Base fare is calculated per kilometer per employee working day.
            </p>
          </div>

          <!-- Status -->
          <div
            class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between"
          >
            <div class="flex flex-col gap-1">
              <span class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase"
                >Configuration Status</span
              >
              <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500"
                >Enable to allow automated allowance calculation.</span
              >
            </div>
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'text-[10px] font-black uppercase tracking-widest',
                  localSettings.is_active
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : 'text-slate-300 dark:text-slate-600',
                ]"
              >
                {{ localSettings.is_active ? "ENABLED" : "DISABLED" }}
              </span>
              <ToggleSwitch
                v-model="localSettings.is_active"
                :disabled="
                  !hasPermission('transport_setting', 'update') || saving
                "
              />
            </div>
          </div>

          <div
            v-if="hasPermission('transport_setting', 'update')"
            class="pt-4 flex gap-3"
          >
            <Button
              label="Save Configuration"
              icon="bi bi-check-lg"
              :loading="saving"
              class="!rounded-xl !px-10 !py-4 !bg-indigo-600 !border-none !font-black !shadow-lg !shadow-indigo-200 dark:!shadow-none text-white hover:!bg-indigo-500 transition-colors"
              @click="saveSettings"
            />
            <Button
              label="Reset"
              icon="bi bi-arrow-clockwise"
              severity="secondary"
              text
              class="!rounded-xl !px-6 !bg-slate-50 dark:!bg-slate-800 !font-bold dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-700 transition-colors"
              @click="resetForm"
              :disabled="saving"
            />
          </div>
          <div
            v-else
            class="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20 flex items-center gap-3 text-amber-600 dark:text-amber-400"
          >
            <i class="bi bi-lock-fill"></i>
            <span class="text-xs font-bold uppercase tracking-tight"
              >Read-Only Mode: Restricted Access</span
            >
          </div>
        </div>
      </Motion>

      <!-- Business Rules -->
      <Motion
        class="lg:col-span-5"
        :initial="{ opacity: 0, x: 20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ delay: 0.3 }"
      >
        <div
          class="bg-indigo-950 dark:bg-slate-900 rounded-2xl p-8 text-white border border-indigo-900 dark:border-slate-800 shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden h-full"
        >
          <i
            class="bi bi-info-circle absolute -right-4 -top-4 text-[10rem] opacity-5"
          ></i>

          <h3
            class="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-indigo-200"
          >
            <span class="w-2 h-6 bg-indigo-400 rounded-full"></span>
            Simulation & Rules
          </h3>

          <!-- Simulation Card -->
          <div
            class="bg-white/10 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 dark:border-slate-700/50 space-y-4 mb-8"
          >
            <div
              class="text-[10px] font-black text-indigo-300 dark:text-indigo-400 uppercase tracking-widest"
            >
              Calculation Example
            </div>
            <div class="flex flex-col gap-3">
              <div class="flex justify-between items-end">
                <span class="text-xs font-medium text-indigo-100 dark:text-slate-300"
                  >Commute Distance</span
                >
                <span class="text-lg font-black"
                  >12.3 km
                  <span class="text-[10px] opacity-50 ml-1">→ 12 km</span></span
                >
              </div>
              <div class="flex justify-between items-end">
                <span class="text-xs font-medium text-indigo-100 dark:text-slate-300"
                  >Working Days</span
                >
                <span class="text-lg font-black">22 DAYS</span>
              </div>
              <div class="w-full h-px bg-white/10 dark:bg-slate-700/50 my-1"></div>
              <div class="flex justify-between items-center pt-2">
                <span class="text-xs font-black text-indigo-300 dark:text-indigo-400 uppercase"
                  >Estimated Total</span
                >
                <span class="text-2xl font-black text-emerald-400">{{
                  formatCurrency(localSettings.base_fare * 12 * 22)
                }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div
              class="text-[10px] font-black text-indigo-300 dark:text-indigo-400 uppercase tracking-widest"
            >
              Validation Parameters
            </div>
            <ul class="space-y-4">
              <li
                v-for="(rule, i) in rules"
                :key="i"
                class="flex items-start gap-3"
              >
                <div
                  class="w-5 h-5 rounded-lg bg-white/10 dark:bg-indigo-500/10 flex items-center justify-center mt-0.5 text-[10px] dark:text-indigo-400"
                >
                  <i class="bi bi-check2"></i>
                </div>
                <span
                  class="text-xs font-medium text-indigo-50/80 dark:text-slate-300 leading-relaxed"
                  >{{ rule }}</span
                >
              </li>
            </ul>
          </div>
        </div>
      </Motion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTransportSettings } from "~/composables/useTransportSettings";
import { useAuth } from "~/composables/useAuth";
import { getErrorMessageAxios } from "~/utils/handleError";

const { hasPermission } = useAuth();
const { settings, updateSettings, formatCurrency, fetchSettings, error } =
  useTransportSettings();

const localSettings = ref({ base_fare: 2000, is_active: true });
const saving = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);
const baseFareError = ref<string | null>(null);

const rules = [
  "Applies exclusively to Permanent employees.",
  "Minimum attendance requirement: 19 working days.",
  "Minimum commute distance threshold > 5 km.",
  "Maximum calculation cap: 25 km.",
  "Nearest integer decimal rounding (0.5 threshold).",
];

onMounted(async () => {
  if (!hasPermission("transport_setting", "read")) {
    return navigateTo("/dashboard");
  }
  await fetchSettings();
  localSettings.value = {
    base_fare: settings.value.base_fare || 2000,
    is_active: settings.value.is_active ?? true,
  };
});

const saveSettings = async () => {
  baseFareError.value = null;
  saveError.value = null;
  saveSuccess.value = false;

  if (!localSettings.value.base_fare || localSettings.value.base_fare <= 0) {
    baseFareError.value = "Base fare must be greater than Rp 0";
    return;
  }

  saving.value = true;

  try {
    await updateSettings({
      base_fare: localSettings.value.base_fare,
      is_active: localSettings.value.is_active,
    });
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err: any) {
    saveError.value =
      getErrorMessageAxios(err) || error.value || "Failed to save configuration";
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  localSettings.value = {
    base_fare: settings.value.base_fare || 2000,
    is_active: settings.value.is_active ?? true,
  };
  baseFareError.value = null;
  saveError.value = null;
};

definePageMeta({ layout: "default" });
</script>
