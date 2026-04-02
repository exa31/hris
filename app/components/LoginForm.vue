<template>
  <div class="login-container">
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="glass-panel">
      <!-- Header -->
      <div class="login-header text-center">
        <div class="brand-logo">
          <i class="bi bi-building"></i>
        </div>
        <h2>Selamat Datang</h2>
        <p>JMC System - Kelola Data Pegawai</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" novalidate>
        <!-- Credential -->
        <div class="custom-input-group">
          <input
            id="credential"
            v-model="credential"
            type="text"
            class="custom-input"
            :class="{ 'border-danger error-shadow': credentialError }"
            placeholder="Username / Email / No. HP"
            @blur="validateCredentialField"
            @input="validateCredentialField"
          />
          <i class="bi bi-person-fill input-icon" :class="{'text-danger': credentialError}"></i>
          <div class="invalid-feedback d-block text-danger fw-medium" v-if="credential && credentialError">
            {{ credentialError }}
          </div>
        </div>

        <!-- Password -->
        <div class="custom-input-group">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="custom-input pe-5"
            :class="{ 'border-danger error-shadow': passwordError }"
            placeholder="Password"
            @input="(e)=>validatePasswordStrength((e.target as HTMLInputElement).value)"
          />
          <i class="bi bi-lock-fill input-icon" :class="{'text-danger': passwordError}"></i>
          <button type="button" class="btn-toggle-password" @click="showPassword = !showPassword">
            <i :class="['bi', showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill']"></i>
          </button>
          <div class="invalid-feedback d-block text-danger fw-medium" v-if="password && passwordError">
            {{ passwordError }}
          </div>
        </div>

        <!-- Captcha Area -->
        <div class="captcha-wrapper mb-4">
          <div class="d-flex justify-content-between align-items-end mb-2 px-1">
            <label class="form-label text-slate fw-bold mb-0" style="font-size: 0.85rem">Verifikasi Keamanan</label>
            <button type="button" class="btn btn-link text-decoration-none btn-sm p-0 text-primary fw-bold" @click="generateCaptcha">
              <i class="bi bi-arrow-clockwise"></i> Muat Ulang
            </button>
          </div>
          
          <div class="captcha-box mb-3 text-center position-relative">
            <div class="captcha-display">{{ captchaCode }}</div>
          </div>
          
          <div class="custom-input-group mb-0">
            <input
              v-model="userCaptcha"
              type="text"
              class="custom-input"
              :class="{ 'border-danger error-shadow': captchaError }"
              placeholder="Ketik kode di atas"
              maxlength="6"
              @keyup="userCaptcha = userCaptcha.toUpperCase()"
            />
            <i class="bi bi-shield-check input-icon" :class="{'text-danger': captchaError}"></i>
            <div class="invalid-feedback d-block text-danger fw-medium" v-if="userCaptcha && captchaError">
              Kode captcha tidak sesuai.
            </div>
          </div>
        </div>

        <!-- Remember Me -->
        <div class="d-flex justify-content-between align-items-center mb-4 px-1">
          <div class="form-check custom-checkbox">
            <input id="rememberMe" v-model="rememberMe" type="checkbox" class="form-check-input" />
            <label class="form-check-label text-slate fw-medium" for="rememberMe" style="cursor:pointer">Ingat saya</label>
          </div>
          <NuxtLink to="/forgot-password" class="text-decoration-none text-primary fw-bold" style="font-size: 0.85rem">
            Lupa Sandi?
          </NuxtLink>
        </div>

        <!-- Login Button -->
        <button type="submit" class="btn-submit w-100 position-relative" :disabled="loading">
          <span :class="{'opacity-0': loading}">Masuk ke Sistem</span>
          <div v-if="loading" class="position-absolute top-50 start-50 translate-middle">
            <div class="spinner-border spinner-border-sm text-white" role="status"></div>
          </div>
        </button>
      </form>
    </div>

    <!-- Alert Toasts -->
    <div class="toast-container position-fixed bottom-0 end-0 p-4" style="z-index: 1100">
      <!-- Success Alert -->
      <div v-if="showSuccess" class="toast show align-items-center text-white bg-success border-0 shadow-lg mb-2 override-toast-animation" role="alert">
        <div class="d-flex">
          <div class="toast-body fw-bold py-3">
            <i class="bi bi-check-circle-fill me-2 fs-5 align-middle"></i>
            Login berhasil! Mengalihkan...
          </div>
          <button type="button" class="btn-close btn-close-white me-3 m-auto" @click="closeSuccessAlert"></button>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="showError" class="toast show align-items-center text-white bg-danger border-0 shadow-lg override-toast-animation" role="alert">
        <div class="d-flex">
          <div class="toast-body fw-bold py-3">
            <i class="bi bi-exclamation-triangle-fill me-2 fs-5 align-middle"></i>
            {{ errorMessage }}
          </div>
          <button type="button" class="btn-close btn-close-white me-3 m-auto" @click="closeErrorAlert"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { validateCredential, validatePassword } from '~/utils/validation';
import { useAuth } from '~/composables/useAuth';

const { login, loading } = useAuth();

const credential = ref('');
const password = ref('');
const userCaptcha = ref('');
const captchaCode = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const credentialError = ref('');
const passwordError = ref('');
const captchaError = ref(false);
const passwordStrength = ref(0);
let successTimeout: ReturnType<typeof setTimeout> | null = null;
let errorTimeout: ReturnType<typeof setTimeout> | null = null;

// Generate captcha on mount
onMounted(() => {
  generateCaptcha();
});

// Generate random captcha
const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  captchaCode.value = result;
  userCaptcha.value = '';
  captchaError.value = false;
};

// Auto-dismiss success alert after 3 seconds
const showSuccessAlert = () => {
  showSuccess.value = true;
  if (successTimeout) clearTimeout(successTimeout);
  successTimeout = setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

// Auto-dismiss error alert after 4 seconds
const showErrorAlert = (message: string) => {
  errorMessage.value = message;
  showError.value = true;
  if (errorTimeout) clearTimeout(errorTimeout);
  errorTimeout = setTimeout(() => {
    showError.value = false;
  }, 4000);
};

// Close success alert and clear timeout
const closeSuccessAlert = () => {
  showSuccess.value = false;
  if (successTimeout) clearTimeout(successTimeout);
};

// Close error alert and clear timeout
const closeErrorAlert = () => {
  showError.value = false;
  if (errorTimeout) clearTimeout(errorTimeout);
};

// Validate credential field
const validateCredentialField = () => {
  if (!credential.value) {
    credentialError.value = 'Credential tidak boleh kosong';
  } else if (!validateCredential(credential.value)) {
    credentialError.value = 'Username/Email/No. HP tidak valid';
  } else {
    credentialError.value = '';
  }
};

// Validate password strength
const validatePasswordStrength = (value: string) => {
  let strength = 0;

  if (value.length >= 8) strength += 20;
  if (value.length >= 12) strength += 10;
  if (/[a-z]/.test(value)) strength += 20;
  if (/[A-Z]/.test(value)) strength += 20;
  if (/[0-9]/.test(value)) strength += 15;
  if (/[!@#$%^&*]/.test(value)) strength += 15;

  passwordStrength.value = Math.min(strength, 100);

  // Validate password
  if (!value) {
    passwordError.value = '';
  } else {
    const error = validatePassword(value);
    passwordError.value = error || '';
  }
};

// Computed
const getPasswordStrengthColor = computed(() => {
  if (passwordStrength.value < 33) return 'danger';
  if (passwordStrength.value < 66) return 'warning';
  return 'success';
});

const getPasswordStrengthClass = computed(() => {
  return `text-${getPasswordStrengthColor.value}`;
});

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 33) return 'Lemah';
  if (passwordStrength.value < 66) return 'Sedang';
  return 'Kuat';
});

// Handle login
const handleLogin = async () => {
  // Clear previous errors
  credentialError.value = '';
  passwordError.value = '';
  captchaError.value = false;

  // Validate credential
  if (!credential.value) {
    credentialError.value = 'Credential tidak boleh kosong';
  } else if (!validateCredential(credential.value)) {
    credentialError.value = 'Username/Email/No. HP tidak valid';
  }

  // Validate password
  const passwordValidationError = validatePassword(password.value);
  if (!password.value) {
    passwordError.value = 'Password tidak boleh kosong';
  } else if (passwordValidationError) {
    passwordError.value = passwordValidationError;
  } else {
    passwordError.value = '';
  }

  // Validate captcha
  if (!userCaptcha.value) {
    captchaError.value = true;
    showErrorAlert('Captcha tidak boleh kosong');
    return;
  }

  if (userCaptcha.value.toUpperCase() !== captchaCode.value) {
    captchaError.value = true;
    generateCaptcha();
    showErrorAlert('Kode captcha tidak sesuai, silakan coba lagi');
    return;
  }

  // Stop if there are validation errors
  if (credentialError.value || passwordError.value) {
    showErrorAlert('Mohon isi semua field dengan benar');
    return;
  }

  // Simulate login request
  try {
    await login(credential.value, password.value, rememberMe.value);

    showSuccessAlert();

    // Redirect after success
    setTimeout(() => {
      navigateTo('/dashboard');
    }, 1500);

  } catch (error: any) {
    // Axios errors: error.response.data contains the server response
    const serverData = error.response?.data

    const errorCodeMap: Record<string, string> = {
      INVALID_CREDENTIALS: 'Username atau password yang Anda masukkan salah.',
      USER_INACTIVE: 'Akun Anda tidak aktif. Silakan hubungi administrator.',
      INVALID_REQUEST: 'Data yang dikirim tidak valid.',
      missing_token: 'Sesi tidak valid. Silakan login kembali.',
    }

    const code = serverData?.code || serverData?.error
    const friendlyMessage = (code && errorCodeMap[code])
      || serverData?.message
      || error.message
      || 'Login gagal. Silakan coba lagi.'

    generateCaptcha() // Reset captcha after failed login
    showErrorAlert(friendlyMessage)
  }
};
</script>

<style scoped>
/* Base Container */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, #f1f5f9 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
}

/* Background Animated Shapes */
.bg-shapes {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 12s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
}

.shape-1 {
  width: 50vw; height: 50vw;
  max-width: 600px; max-height: 600px;
  background: #667eea;
  top: -15%; left: -15%;
  animation-delay: 0s;
}

.shape-2 {
  width: 45vw; height: 45vw;
  max-width: 500px; max-height: 500px;
  background: #a78bfa;
  bottom: -20%; right: -10%;
  animation-delay: -5s;
}

.shape-3 {
  width: 30vw; height: 30vw;
  max-width: 400px; max-height: 400px;
  background: #7c8ef4;
  top: 30%; left: 50%;
  animation-delay: -2s;
  opacity: 0.3;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, 60px) scale(1.1); }
}

/* Glassmorphism Panel */
.glass-panel {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.4) inset;
  width: 100%;
  max-width: 460px;
  padding: 3.5rem 2.5rem;
}

.glass-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 6px;
  background: linear-gradient(90deg, #667eea, #a78bfa);
  border-radius: 28px 28px 0 0;
}

/* Brand & Header */
.brand-logo {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #667eea, #a78bfa);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 12px 25px -8px rgba(102, 126, 234, 0.6);
  transform: rotate(-5deg);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.glass-panel:hover .brand-logo {
  transform: rotate(0deg) scale(1.05);
}

.brand-logo i {
  font-size: 2.2rem;
  color: white;
}

.login-header h2 {
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.85rem;
  letter-spacing: -0.5px;
}

.login-header p {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
  font-weight: 500;
}

/* Inputs & Forms */
.text-slate { color: #64748b; }
.text-primary { color: #667eea !important; }

.custom-input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.custom-input {
  width: 100%;
  padding: 1.1rem 1rem 1.1rem 3.2rem;
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02) inset;
}

.custom-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 2px 4px rgba(0,0,0,0.02) inset;
  background: #ffffff !important;
}

.custom-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.error-shadow:focus {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.15), 0 2px 4px rgba(0,0,0,0.02) inset !important;
}

.input-icon {
  position: absolute;
  left: 1.1rem;
  top: 1.1rem;
  color: #94a3b8;
  font-size: 1.3rem;
  transition: color 0.3s ease;
  pointer-events: none;
}

.custom-input:focus + .input-icon, 
.custom-input:not(:placeholder-shown) + .input-icon {
  color: #667eea;
}

.btn-toggle-password {
  position: absolute;
  right: 1.1rem;
  top: 1.1rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
  font-size: 1.2rem;
}

.btn-toggle-password:hover {
  color: #667eea;
}

/* Captcha */
.captcha-wrapper {
  background: rgba(255,255,255,0.4);
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.6);
}

.captcha-box {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 0.8rem;
}

.captcha-display {
  font-size: 1.8rem;
  letter-spacing: 12px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 900;
  color: #334155;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.15);
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 0.5rem;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  user-select: none;
}

.captcha-display::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -10%;
  width: 120%;
  height: 2px;
  background: rgba(102, 126, 234, 0.4);
  transform: rotate(-4deg);
}

.captcha-display::before {
  content: '';
  position: absolute;
  top: 40%;
  left: -10%;
  width: 120%;
  height: 1px;
  background: rgba(167, 139, 250, 0.5);
  transform: rotate(5deg);
}

/* Checkbox */
.custom-checkbox .form-check-input {
  width: 1.25em;
  height: 1.25em;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  cursor: pointer;
  margin-top: 0.15rem;
}

.custom-checkbox .form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
}

/* Submit Button */
.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 1.15rem;
  font-weight: 700;
  font-size: 1.05rem;
  box-shadow: 0 10px 20px -8px rgba(102, 126, 234, 0.7);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  letter-spacing: 0.5px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px -8px rgba(102, 126, 234, 0.85);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(1px);
}

.invalid-feedback {
  font-size: 0.85rem;
  margin-top: 0.4rem;
  padding-left: 0.5rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Toast Animations Overlay */
.override-toast-animation {
  animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@media (max-width: 576px) {
  .glass-panel {
    padding: 2.5rem 1.5rem;
    border-radius: 20px;
  }
}
</style>
