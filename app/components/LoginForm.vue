<template>
  <div
    class="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden font-sans"
  >
    <!-- Animated Background -->
    <div class="absolute inset-0 z-0">
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] animate-pulse"
        style="animation-delay: 2s"
      ></div>
      <div
        class="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px] animate-pulse"
        style="animation-delay: 4s"
      ></div>
    </div>

    <Motion
      :initial="{ opacity: 0, scale: 0.95, y: 20 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :transition="{ duration: 0.6, ease: 'easeOut' }"
      class="relative z-10 w-full max-w-[480px] px-6"
    >
      <div
        class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl p-8 md:p-12"
      >
        <!-- Logo & Header -->
        <div class="text-center mb-10">
          <Motion
            :initial="{ scale: 0.5, rotate: -20 }"
            :animate="{ scale: 1, rotate: 0 }"
            :transition="{
              type: 'spring',
              damping: 12,
              stiffness: 200,
              delay: 0.2,
            }"
            class="inline-flex items-center justify-center mb-6"
          >
            <NexusLogo :size="84" />
          </Motion>
          <h2 class="text-3xl font-extrabold text-white tracking-tight mb-2">
            Selamat Datang
          </h2>
          <p class="text-slate-400 font-medium">
            NexusHR - Human Resource Portal
          </p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label
              for="credential"
              class="text-sm font-semibold text-slate-300 ml-1"
              >Username / Email</label
            >
            <div class="relative group">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
              >
                <i class="bi bi-person text-xl"></i>
              </span>
              <InputText
                id="credential"
                v-model="credential"
                placeholder="Masukkan username atau email"
                class="w-full !pl-12 !py-4 !bg-white/5 !border-white/10 !text-white !rounded-2xl focus:!border-indigo-500/50 focus:!ring-4 focus:!ring-indigo-500/10 transition-all placeholder:text-slate-600"
                :class="{ 'p-invalid': !!credentialError }"
              />
            </div>
            <Transition name="fade-slide">
              <small
                v-if="credentialError"
                class="text-rose-400 text-xs font-medium ml-1 flex items-center gap-1"
              >
                <i class="bi bi-exclamation-circle"></i> {{ credentialError }}
              </small>
            </Transition>
          </div>

          <div class="space-y-2">
            <label
              for="password"
              class="text-sm font-semibold text-slate-300 ml-1"
              >Password</label
            >
            <div class="relative group">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
              >
                <i class="bi bi-lock text-xl"></i>
              </span>
              <Password
                id="password"
                v-model="password"
                placeholder="••••••••"
                :toggleMask="true"
                :feedback="false"
                class="w-full"
                inputClass="w-full !pl-12 !py-4 !bg-white/5 !border-white/10 !text-white !rounded-2xl focus:!border-indigo-500/50 focus:!ring-4 focus:!ring-indigo-500/10 transition-all placeholder:text-slate-600"
                :class="{ 'p-invalid': !!passwordError }"
              />
            </div>
            <Transition name="fade-slide">
              <small
                v-if="passwordError"
                class="text-rose-400 text-xs font-medium ml-1 flex items-center gap-1"
              >
                <i class="bi bi-exclamation-circle"></i> {{ passwordError }}
              </small>
            </Transition>
          </div>

          <!-- Captcha Section -->
          <div
            class="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                >Verifikasi Keamanan</span
              >
              <button
                type="button"
                @click="generateCaptcha"
                class="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <i class="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>

            <div
              class="h-16 flex items-center justify-center bg-slate-900/50 rounded-xl border border-white/5 relative overflow-hidden"
            >
              <div class="absolute inset-0 opacity-10 pointer-events-none">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="absolute bg-white h-px w-full"
                  :style="{
                    top: i * 20 + '%',
                    transform: 'rotate(' + (Math.random() * 10 - 5) + 'deg)',
                  }"
                ></div>
              </div>
              <span
                class="text-3xl font-black text-white tracking-[0.6em] select-none italic opacity-80"
                >{{ captchaCode }}</span
              >
            </div>

            <InputText
              v-model="userCaptcha"
              placeholder="Masukkan kode di atas"
              maxlength="6"
              class="w-full !py-3 !bg-white/5 !border-white/10 !text-white !rounded-xl text-center font-bold tracking-widest focus:!border-indigo-500/50"
              @keyup="userCaptcha = userCaptcha.toUpperCase()"
            />
          </div>

          <div class="flex items-center justify-between px-1">
            <div
              class="flex items-center gap-2 group cursor-pointer"
              @click="rememberMe = !rememberMe"
            >
              <div
                class="w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center"
                :class="
                  rememberMe
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-white/10 bg-white/5 group-hover:border-white/20'
                "
              >
                <i
                  v-if="rememberMe"
                  class="bi bi-check-lg text-white text-xs"
                ></i>
              </div>
              <span class="text-sm font-medium text-slate-400 select-none"
                >Ingat saya</span
              >
            </div>
            <NuxtLink
              to="/forgot-password"
              class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >Lupa Password?</NuxtLink
            >
          </div>

          <Button
            type="submit"
            :loading="loading"
            class="w-full !py-4 !rounded-2xl !bg-gradient-to-r !from-indigo-600 !to-violet-600 !border-none !text-white !font-bold !text-lg !shadow-xl !shadow-indigo-600/20 hover:!shadow-indigo-600/40 hover:!-translate-y-0.5 active:!translate-y-0 transition-all"
            label="Masuk Ke Sistem"
          />
        </form>
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { validateCredential, validatePassword } from "~/utils/validation";
import { useAuth } from "~/composables/useAuth";

const toast = useToast();
const { login, loading } = useAuth();

const credential = ref("");
const password = ref("");
const userCaptcha = ref("");
const captchaCode = ref("");
const rememberMe = ref(false);

const credentialError = ref("");
const passwordError = ref("");

onMounted(() => {
  generateCaptcha();
});

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  captchaCode.value = result;
  userCaptcha.value = "";
};

const handleLogin = async () => {
  credentialError.value = "";
  passwordError.value = "";

  if (!credential.value) {
    credentialError.value = "Username/Email tidak boleh kosong";
  } else if (!validateCredential(credential.value)) {
    credentialError.value = "Format username/email tidak valid";
  }

  const pVal = validatePassword(password.value);
  if (!password.value) {
    passwordError.value = "Password tidak boleh kosong";
  } else if (pVal) {
    passwordError.value = pVal;
  }

  if (credentialError.value || passwordError.value) return;

  if (userCaptcha.value.toUpperCase() !== captchaCode.value) {
    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Kode captcha tidak sesuai",
      life: 3000,
    });
    generateCaptcha();
    return;
  }

  try {
    await login(credential.value, password.value, rememberMe.value);
    toast.add({
      severity: "success",
      summary: "Berhasil",
      detail: "Login berhasil, mengalihkan...",
      life: 2000,
    });

    setTimeout(() => {
      navigateTo("/dashboard");
    }, 1200);
  } catch (error: any) {
    const serverData = error.response?.data;
    const message =
      serverData?.message || "Gagal masuk. Silakan periksa kembali akun Anda.";
    toast.add({
      severity: "error",
      summary: "Login Gagal",
      detail: message,
      life: 4000,
    });
    generateCaptcha();
  }
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

:deep(.p-inputtext) {
  font-family: inherit;
}

:deep(.p-password-input) {
  width: 100%;
}
</style>
