<template>
  <div class="login-form">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-5">
          <div class="card shadow-lg">
            <!-- Header -->
            <div class="card-body p-5 text-center border-bottom">
              <h1 class="h2 fw-bold mb-2">Login</h1>
              <p class="text-muted mb-0">Masukkan kredensial Anda untuk mengakses aplikasi</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin" class="card-body p-5 needs-validation" novalidate>
              <!-- Username / Email / Phone -->
              <div class="mb-4">
                <label for="credential" class="form-label fw-bold">Username / Email / No. HP</label>
                <div class="input-group has-validation">
                  <span class="input-group-text bg-white">
                    <i class="bi bi-person-fill"></i>
                  </span>
                  <input
                    id="credential"
                    v-model="credential"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': credentialError }"
                    placeholder="Masukkan username, email, atau nomor HP"
                    @blur="validateCredentialField"
                    @input="validateCredentialField"
                  />
                  <div class="invalid-feedback d-block" v-if="credential && credentialError">
                    {{ credentialError }}
                  </div>
                </div>
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label for="password" class="form-label fw-bold">Password</label>
                <div class="input-group mb-2">
                  <span class="input-group-text bg-white">
                    <i class="bi bi-lock-fill"></i>
                  </span>
                  <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': passwordError }"
                    placeholder="Masukkan password"
                    @input="(e)=>validatePasswordStrength((e.target as HTMLInputElement).value)"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
                  </button>
                  <div class="invalid-feedback d-block" v-if="password && passwordError">
                    {{ passwordError }}
                  </div>
                </div>                  
              </div>

              <!-- Captcha -->
              <div class="mb-4 p-3 bg-light rounded border">
                <label class="form-label fw-bold mb-2">Kode Captcha</label>
                <div
                  class="captcha-display bg-white border rounded p-3 text-center mb-3 fw-bold text-primary"
                  style="font-size: 1.5rem; letter-spacing: 4px; font-family: monospace"
                >
                  {{ captchaCode }}
                </div>
                <div class="input-group has-validation mb-2">
                  <span class="input-group-text bg-white">
                    <i class="bi bi-shield-check"></i>
                  </span>
                  <input
                    v-model="userCaptcha"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': captchaError }"
                    placeholder="Contoh: ABC123"
                    maxlength="6"
                    @keyup="userCaptcha = userCaptcha.toUpperCase()"
                  />
                  <div class="invalid-feedback d-block" v-if="userCaptcha && captchaError">
                    Kode captcha tidak sesuai
                  </div>
                </div>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="generateCaptcha"
                >
                  <i class="bi bi-arrow-clockwise"></i>
                  Refresh Captcha
                </button>
              </div>

              <!-- Remember Me -->
              <div class="mb-4 form-check">
                <input
                  id="rememberMe"
                  v-model="rememberMe"
                  type="checkbox"
                  class="form-check-input"
                />
                <label class="form-check-label" for="rememberMe">
                  <small>
                    <strong>Ingat saya</strong> - Anda tidak akan ter-logout secara otomatis
                  </small>
                </label>
              </div>

              <!-- Login Button -->
              <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-bold"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Memproses...' : 'Login' }}
              </button>

              <!-- Divider -->
              <hr class="my-4" />

              <!-- Additional Links -->
              <div class="text-center">
                <small class="text-muted">
                  Lupa password?
                  <NuxtLink to="/forgot-password" class="text-decoration-none fw-bold">
                    Reset di sini
                  </NuxtLink>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Alert -->
    <div
      v-if="showSuccess"
      class="alert alert-success alert-dismissible fade show position-fixed bottom-0 end-0 m-3"
      role="alert"
    >
      <i class="bi bi-check-circle-fill me-2"></i>
      Login berhasil! Mengarahkan...
      <button type="button" class="btn-close" @click="closeSuccessAlert"></button>
    </div>

    <!-- Error Alert -->
    <div
      v-if="showError"
      class="alert alert-danger alert-dismissible fade show position-fixed bottom-0 end-0 m-3"
      role="alert"
    >
      <i class="bi bi-exclamation-circle-fill me-2"></i>
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="closeErrorAlert"></button>
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
.login-form {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.input-group-text {
  border-color: #e0e0e0;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background-color: #667eea;
  border-color: #667eea;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #764ba2;
  border-color: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.captcha-display {
  user-select: none;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 300px;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-success {
  color: #28a745 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
}

.bg-success {
  background-color: #28a745 !important;
}
</style>
