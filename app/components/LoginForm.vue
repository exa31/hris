<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
    <!-- Left Column: Branding Showcase (Visible on Large Screens) -->
    <div class="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-r border-white/5">
      <!-- Ambient Glow Orbs -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:32px_32px] pointer-events-none"></div>

      <!-- Top Branding -->
      <div class="relative z-10 flex items-center gap-3">
        <NexusLogo :size="40" />
        <span class="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-200 to-violet-400 tracking-tight">
          NexusHR
        </span>
        <span class="ml-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Enterprise
        </span>
      </div>

      <!-- Center Showcase Content -->
      <div class="relative z-10 space-y-8 max-w-xl my-auto py-12">
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
          class="space-y-4"
        >
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <i class="bi bi-shield-check text-sm"></i>
            <span>Human Resource Intelligence Platform</span>
          </div>

          <h1 class="text-4xl xl:text-5xl font-black tracking-tight leading-[1.15]">
            Empower Your Modern <br />
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400">
              Workforce Intelligence.
            </span>
          </h1>

          <p class="text-slate-400 text-sm xl:text-base leading-relaxed">
            Streamline employee records, real-time presence, automated leave approvals, and financial logistics in one unified platform.
          </p>
        </Motion>

        <!-- Quick Features List -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm space-y-1">
            <i class="bi bi-lightning-charge-fill text-indigo-400 text-lg"></i>
            <div class="text-xs font-bold text-slate-200">Fast Presence</div>
            <div class="text-[11px] text-slate-500 leading-tight">Instant logs & verified check-ins</div>
          </div>
          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm space-y-1">
            <i class="bi bi-calendar2-check-fill text-violet-400 text-lg"></i>
            <div class="text-xs font-bold text-slate-200">Leave Flow</div>
            <div class="text-[11px] text-slate-500 leading-tight">Automated multi-tier approvals</div>
          </div>
          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm space-y-1">
            <i class="bi bi-shield-lock-fill text-emerald-400 text-lg"></i>
            <div class="text-xs font-bold text-slate-200">RBAC Security</div>
            <div class="text-[11px] text-slate-500 leading-tight">Granular permission matrix</div>
          </div>
        </div>

        <!-- Enterprise Security & Support Notice -->
        <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
          <div class="text-xs font-bold text-slate-300 flex items-center gap-2">
            <i class="bi bi-shield-check text-emerald-400"></i>
            <span>Enterprise Security & Compliance</span>
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">
            Portal ini dilindungi autentikasi sesi terenkripsi. Silakan gunakan akun resmi yang terdaftar oleh administrator HR atau IT departemen perusahaan Anda.
          </p>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="relative z-10 flex items-center justify-between text-xs text-slate-500">
        <span>© 2026 NexusHR Enterprise Portal</span>
        <NuxtLink to="/" class="hover:text-indigo-400 transition-colors flex items-center gap-1 font-semibold">
          <i class="bi bi-arrow-left"></i>
          <span>Kembali ke Beranda</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Right Column: Login Card -->
    <div class="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 relative z-10">
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
        class="w-full max-w-md space-y-8"
      >
        <!-- Top Mobile Header / Logo -->
        <div class="text-center lg:text-left space-y-2">
          <div class="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <NexusLogo :size="44" />
            <span class="text-2xl font-black tracking-tight text-white">NexusHR</span>
          </div>
          <h2 class="text-3xl font-black text-white tracking-tight">
            Welcome Back
          </h2>
          <p class="text-slate-400 text-sm">
            Enter your account credentials to access the workspace.
          </p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Credential Field -->
          <div class="space-y-1.5">
            <label for="credential" class="text-xs font-bold text-slate-300 ml-0.5">
              Username or Email <span class="text-rose-400">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                <i class="bi bi-person text-lg"></i>
              </span>
              <InputText
                id="credential"
                v-model="credential"
                @input="credentialError = ''"
                placeholder="Masukkan username atau email"
                class="w-full !pl-11 !py-3.5 !bg-white/5 !text-white !rounded-xl focus:!border-indigo-500 focus:!ring-2 focus:!ring-indigo-500/20 text-sm transition-all"
                :class="[
                  credentialError
                    ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-500/10'
                    : '!border !border-white/10',
                ]"
              />
            </div>
            <small v-if="credentialError" class="text-rose-400 text-xs font-medium ml-1 flex items-center gap-1">
              <i class="bi bi-exclamation-circle"></i> {{ credentialError }}
            </small>
          </div>

          <!-- Password Field -->
          <div class="space-y-1.5">
            <label for="password" class="text-xs font-bold text-slate-300 ml-0.5">
              Password <span class="text-rose-400">*</span>
            </label>
            <div class="relative">
              <Password
                id="password"
                v-model="password"
                @input="passwordError = ''"
                placeholder="••••••••"
                :toggleMask="true"
                :feedback="false"
                fluid
                class="w-full"
                :inputClass="[
                  'w-full !pl-11 !py-3.5 !bg-white/5 !text-white !rounded-xl focus:!border-indigo-500 focus:!ring-2 focus:!ring-indigo-500/20 text-sm transition-all',
                  passwordError
                    ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-500/10'
                    : '!border !border-white/10',
                ]"
              />
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
                <i class="bi bi-lock text-lg"></i>
              </span>
            </div>
            <small v-if="passwordError" class="text-rose-400 text-xs font-medium ml-1 flex items-center gap-1">
              <i class="bi bi-exclamation-circle"></i> {{ passwordError }}
            </small>
          </div>

          <!-- Captcha Box -->
          <div class="p-4 bg-white/[0.03] rounded-2xl border border-white/10 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Security Verification
              </span>
              <button
                type="button"
                class="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                @click="generateCaptcha"
              >
                <i class="bi bi-arrow-clockwise"></i> Refresh Code
              </button>
            </div>

            <div class="h-14 flex items-center justify-center bg-slate-900/80 rounded-xl border border-white/5 relative overflow-hidden select-none">
              <!-- Noise Lines -->
              <div class="absolute inset-0 opacity-20 pointer-events-none">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="absolute bg-white/40 h-px w-full"
                  :style="{ top: i * 25 + '%', transform: 'rotate(' + (i * 3 - 6) + 'deg)' }"
                ></div>
              </div>
              <span class="text-2xl font-black text-indigo-300 tracking-[0.5em] italic">
                {{ captchaCode }}
              </span>
            </div>

            <InputText
              v-model="userCaptcha"
              @input="captchaError = ''"
              placeholder="Enter code above"
              maxlength="6"
              class="w-full !py-2.5 !bg-white/5 !text-white !rounded-xl text-center font-bold tracking-widest text-sm focus:!border-indigo-500 transition-all"
              :class="[
                captchaError
                  ? '!border !border-rose-500 !ring-2 !ring-rose-500/20 bg-rose-500/10'
                  : '!border !border-white/10',
              ]"
              @keyup="userCaptcha = userCaptcha.toUpperCase()"
            />
            <small v-if="captchaError" class="text-rose-400 text-xs font-medium ml-1 flex items-center justify-center gap-1">
              <i class="bi bi-exclamation-circle"></i> {{ captchaError }}
            </small>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-2.5">
              <Checkbox
                v-model="rememberMe"
                :binary="true"
                inputId="rememberMe"
              />
              <label for="rememberMe" class="text-xs font-medium text-slate-400 select-none cursor-pointer hover:text-slate-200">
                Remember my session
              </label>
            </div>

            <span class="text-xs text-slate-500">
              Active for 30 days
            </span>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            :loading="loading"
            label="Sign In to Portal"
            icon="bi bi-box-arrow-in-right"
            class="w-full !py-4 !rounded-xl !bg-indigo-600 hover:!bg-indigo-500 !border-none !text-white !font-black !text-sm !uppercase !tracking-wider !shadow-xl !shadow-indigo-600/30 transition-all cursor-pointer"
          />
        </form>


      </Motion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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
const captchaError = ref("");

onMounted(() => {
  generateCaptcha();
});

const generateCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  captchaCode.value = result;
  userCaptcha.value = "";
  captchaError.value = "";
};



const handleLogin = async () => {
  credentialError.value = "";
  passwordError.value = "";
  captchaError.value = "";

  if (!credential.value) {
    credentialError.value = "Username or email is required";
  } else if (!validateCredential(credential.value)) {
    credentialError.value = "Invalid username or email format";
  }

  const pVal = validatePassword(password.value);
  if (!password.value) {
    passwordError.value = "Password is required";
  } else if (pVal) {
    passwordError.value = pVal;
  }

  if (credentialError.value || passwordError.value) return;

  if (userCaptcha.value.toUpperCase() !== captchaCode.value) {
    captchaError.value = "Captcha security code does not match";
    toast.add({
      severity: "error",
      summary: "Verification Failed",
      detail: "Captcha security code does not match",
      life: 3000,
    });
    generateCaptcha();
    return;
  }

  try {
    await login(credential.value, password.value, rememberMe.value);
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Sign in successful, redirecting to dashboard...",
      life: 2000,
    });

    setTimeout(() => {
      navigateTo("/dashboard");
    }, 800);
  } catch (error: any) {
    const serverData = error.response?.data;
    const message =
      serverData?.message || "Sign in failed. Please verify your credentials.";
    toast.add({
      severity: "error",
      summary: "Sign In Failed",
      detail: message,
      life: 4000,
    });
    generateCaptcha();
  }
};
</script>
