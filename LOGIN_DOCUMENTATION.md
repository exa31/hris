# 📝 LOGIN SYSTEM DOCUMENTATION

## Overview

Login adalah gerbang keamanan (autentikasi) pada aplikasi yang berfungsi untuk memverifikasi identitas pengguna sebelum diberikan akses ke fitur atau data tertentu.

## Default Seeded Accounts

Setelah menjalankan migration seed, sistem menyediakan 3 akun default berikut untuk login awal:

| No  | Username       | Email                  | No. HP      | Role        |
| --- | -------------- | ---------------------- | ----------- | ----------- |
| 1   | superadmin     | superadmin@company.com | 08123456789 | Super Admin |
| 2   | siti.nurhaliza | siti@company.com       | 08234567890 | Manager HRD |
| 3   | ahmad.rahman   | ahmad@company.com      | 08345678901 | Admin HRD   |

Password default untuk ketiga akun di atas:

```text
P@ssword123
```

Catatan:

- Akun di atas berasal dari seed pada migration `migrations/1775069030544_add-seed-data.js`.
- Gunakan hanya untuk development/testing.
- Sangat disarankan mengganti password default setelah login pertama.

## Features

### 1. Multi-Credential Login

Pengguna dapat login dengan salah satu credential:

- **Username**: Minimal 3 karakter
- **Email**: Format email yang valid (xxx@xxx.xxx)
- **Nomor HP**: Format Indonesia (08xx atau +628xx)

### 2. Password Security

Password harus memenuhi kriteria:

- ✅ Minimal 8 karakter
- ✅ Mengandung huruf besar (A-Z)
- ✅ Mengandung huruf kecil (a-z)
- ✅ Mengandung angka (0-9)
- ✅ Mengandung karakter khusus (!@#$%^&\*)

### 3. CAPTCHA Verification

- Sistem captcha 6 karakter alphanumeric
- Case-insensitive validation
- Otomatis refresh jika salah
- Tombol manual refresh tersedia

### 4. Remember Me Functionality

- Checkbox untuk mengingat sesi login
- Jika diaktifkan: Session tetap hidup selama 30 hari
- Jika tidak diaktifkan: Session hangus dalam 1 hari
- User harus logout manual ketika ingat device

### 5. Password Strength Indicator

- Visual progress bar untuk mengukur kekuatan password
- 3 Level: Lemah (merah), Sedang (oranye), Kuat (hijau)
- Real-time feedback saat user mengetik

## Project Structure

```
app/
├── pages/
│   └── index.vue                 # Login page utama
├── components/
│   └── LoginForm.vue             # Form component login
├── composables/
│   ├── useCaptcha.ts             # Captcha logic
│   └── useAuth.ts                # Authentication composable
├── utils/
│   └── validation.ts             # Validation utilities
└── layouts/
    └── auth.vue                  # Layout untuk login page

server/
├── api/
│   ├── login.post.ts             # Login endpoint
│   ├── logout.post.ts            # Logout endpoint
│   └── user.get.ts               # Get user data
└── middleware/
    └── auth.ts                   # Authentication middleware
```

## API Endpoints

### POST /api/login

Login endpoint untuk autentikasi user.

**Request Body:**

```json
{
  "credential": "username atau email atau no.hp",
  "password": "password123!",
  "rememberMe": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "employee_id": 1,
    "username": "user123",
    "role": "Manager",
    "employee": {
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Manager",
      "department": "Marketing"
    }
  }
}
```

**Error Response (401/403):**

```json
{
  "statusCode": 401,
  "statusMessage": "Username/Email/No. HP atau password salah"
}
```

### POST /api/logout

Logout endpoint untuk akhiri sesi user.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

### GET /api/user

Get data user yang sedang login.

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "user123"
  }
}
```

**Error Response (401):**

```json
{
  "statusCode": 401,
  "statusMessage": "Belum login"
}
```

## Usage

### 1. Login Form

Pengguna dapat mengakses login page di:

```
http://localhost:3000/
```

### 2. Using Auth Composable

Untuk handle login di component:

```vue
<script setup>
const { login, logout, user, isAuthenticated } = useAuth();

const handleLogin = async () => {
  try {
    await login("username", "Password123!", true);
    console.log("Login berhasil!");
  } catch (error) {
    console.error("Login gagal:", error.message);
  }
};
</script>
```

### 3. Protected Routes

Buat protected route dengan middleware:

```vue
<script setup>
definePageMeta({
  middleware: "auth", // Require authentication
});
</script>
```

## Validation Rules

### Username

- Minimal 3 karakter
- Alphanumeric dan underscore

### Email

- Format: xxx@xxx.xxx
- Valid domain

### Phone Number

- Format Indonesia: 08xx atau +628xx
- Panjang: 9-12 digit setelah prefix

### Password

- Minimal 8 karakter
- Harus mengandung: uppercase, lowercase, number, special char
- Tidak boleh mengandung username atau email

### Captcha

- Tepat 6 karakter
- Alphanumeric (A-Z, 0-9)
- Case-insensitive

## Security Features

1. ✅ HTTPS Only Cookies (secure flag)
2. ✅ HttpOnly Cookies (prevent XSS)
3. ✅ SameSite Protection (prevent CSRF)
4. ✅ Password Hashing (bcrypt)
5. ✅ CAPTCHA Verification
6. ✅ Account Status Check
7. ✅ Rate Limiting (recommended)
8. ✅ Session Management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# atau
pnpm install
```

### 2. Setup Database

```bash
# Run migrations
npm run migrate:up
```

### 3. Seeded User (Ready to Login)

Jika migration seed sudah dijalankan, langsung login menggunakan salah satu akun pada section **Default Seeded Accounts**.

### 4. Create User (Optional)

Jika ingin menambah user manual di database:

```sql
-- Create user dengan password hash (gunakan bcrypt)
INSERT INTO users (employee_id, username, password_hash, role_id, is_active)
VALUES (1, 'testuser', '$2b$10$...', 1, true);
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Open Browser

```
http://localhost:3000
```

## Best Practices

1. **Always hash passwords** sebelum save ke database
2. **Use HTTPS** di production
3. **Implement rate limiting** untuk prevent brute force
4. **Log login attempts** untuk security audit
5. **Set session timeout** sesuai kebutuhan
6. **Validate input** both client dan server side
7. **Handle errors gracefully** tanpa expose sensitive info

## TODO Items

- [ ] Implement JWT token generation
- [ ] Add rate limiting untuk prevent brute force
- [ ] Add 2FA (Two Factor Authentication)
- [ ] Add login history logging
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add device fingerprinting
- [ ] Implement OAuth integration (Google, Microsoft)

## Troubleshooting

### Login button tidak responsif

- Check browser console untuk error
- Ensure API endpoint `/api/login` accessible
- Verify database connection

### CAPTCHA tidak muncul

- Check console network tab
- Verify component mounting
- Ensure Vuetify properly configured

### Session tidak tersimpan

- Check browser cookie settings
- Verify auth middleware running
- Check secure flag pada production

### Password validation error

- Ensure password memenuhi semua kriteria
- Check validation logic di `validation.ts`
- Test dengan password: `TestPassword123!`

## Support

Untuk pertanyaan atau report bug, silakan hubungi tim development.

---

**Last Updated**: April 11, 2026
**Version**: 1.0.0
