# Dokumentasi API JMC

Dokumen ini merangkum endpoint backend yang tersedia pada aplikasi JMC.

## Ringkasan Teknis

- Framework server: Nuxt server API (Nitro)
- Base URL lokal: `http://localhost:3000`
- Prefix endpoint: `/api`
- Format response standar (kebanyakan endpoint):

```json
{
  "message": "OK",
  "success": true,
  "data": {},
  "code": "SUCCESS",
  "timestamp": "2026-04-03T10:00:00.000Z"
}
```

## Autentikasi dan Otorisasi

Aplikasi menggunakan JWT access token dan refresh token.

- Header yang didukung:
  - `Authorization: Bearer <access_token>`
- Cookie yang digunakan:
  - `access_token`
  - `refresh_token`

Catatan penting:
- Beberapa endpoint memakai middleware `withAuth` (login wajib).
- Endpoint lain memakai `withPermission` (login + cek permission module/action).
- Jika token tidak ada/tidak valid, API mengembalikan status `401`.
- Jika permission tidak cukup, API mengembalikan status `403`.

## Daftar Endpoint

### Auth

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/credentials` | Login username dan password |
| GET | `/api/auth/me` | Profil user saat ini |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/stream` | Endpoint stream auth (internal) |

### Dashboard

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/dashboard/stats` | Statistik dashboard |
| GET | `/api/dashboard/new-employees` | Pegawai terbaru |

### Users

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/users` | List user (filter/pagination) |
| POST | `/api/users` | Buat user baru |
| GET | `/api/users/[id]` | Detail user |
| PUT | `/api/users/[id]` | Update user |
| DELETE | `/api/users/[id]` | Hapus user |
| GET | `/api/users/roles` | List role untuk user form |
| GET | `/api/users/check-username` | Validasi ketersediaan username |
| GET | `/api/users/employee-search` | Cari pegawai yang belum punya akun |

### Roles

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/roles` | List role |
| PUT | `/api/roles/[id]` | Update role |
| GET | `/api/roles/permissions` | List permission |

### Employees

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/employees` | List pegawai (filter/pagination) |
| POST | `/api/employees` | Buat pegawai |
| GET | `/api/employees/[id]` | Detail pegawai |
| PUT | `/api/employees/[id]` | Update pegawai |
| DELETE | `/api/employees/[id]` | Hapus pegawai |
| POST | `/api/employees/bulk-delete` | Hapus banyak pegawai |
| POST | `/api/employees/bulk-status` | Ubah status banyak pegawai |
| GET | `/api/employees/export-excel` | Export data pegawai ke Excel |
| GET | `/api/employees/export-pdf` | Export data pegawai ke PDF |

### Educations

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/educations` | List master pendidikan |
| POST | `/api/educations` | Tambah master pendidikan |
| GET | `/api/educations/[employeeId]` | List riwayat pendidikan pegawai |
| PUT | `/api/educations/[employeeId]` | Update riwayat pendidikan pegawai |
| DELETE | `/api/educations/[id]` | Hapus riwayat pendidikan |

### Transport Allowance

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/transport-allowance` | List tunjangan transport |
| POST | `/api/transport-allowance/generate` | Generate tunjangan bulanan |
| GET | `/api/transport-allowance/settings` | Ambil setting transport |
| PUT | `/api/transport-allowance/settings` | Simpan setting transport |

### Locations

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/locations/regencies` | Cari kabupaten/kota (`q`) |
| GET | `/api/locations/districts` | Cari kecamatan (`q`) |

### Activity Logs

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/activity-logs` | List log aktivitas |
| POST | `/api/activity-logs/log-access` | Simpan log akses |

### Upload

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/upload` | Upload foto/berkas gambar |

## Contoh Endpoint Penting

### 1) Login

`POST /api/auth/credentials`

Request body:

```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

Contoh response sukses:

```json
{
  "message": "Login berhasil",
  "success": true,
  "code": "SUCCESS",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "employee_name": "Administrator",
      "role": "Super Admin"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 2) Ambil Profil User

`GET /api/auth/me`

Header:

```http
Authorization: Bearer <access_token>
```

### 3) List Pegawai

`GET /api/employees?limit=10&offset=0&search=&sortDirection=desc`

Query umum:

- `limit`, `offset`
- `search`
- `department`
- `status` (true/false)
- `sortColumn`, `sortDirection`
- `positions` (comma-separated)
- `tenureOperator`, `tenureValue`

### 4) Buat User

`POST /api/users`

Request body:

```json
{
  "employee_id": 10,
  "username": "john.doe",
  "password": "StrongPwd123!",
  "role_id": 2,
  "is_active": true
}
```

### 5) Simpan Transport Setting

`PUT /api/transport-allowance/settings`

Request body:

```json
{
  "base_fare": 3000,
  "is_active": true
}
```

### 6) Upload Gambar

`POST /api/upload`

- Content type: `multipart/form-data`
- Field file: `file`
- Tipe file: `image/jpeg`, `image/png`, `image/webp`
- Maksimal ukuran: 2 MB

Contoh response:

```json
{
  "url": "/uploads/1712123123-abcd1234.jpg"
}
```

## Dokumentasi Swagger / OpenAPI

File OpenAPI tersedia di:

- `docs/openapi.yaml`

Cara pakai cepat:

1. Buka Swagger Editor: https://editor.swagger.io/
2. Pilih menu **File > Import file**
3. Upload file `docs/openapi.yaml`
4. Swagger UI akan menampilkan endpoint untuk eksplorasi

## Catatan

- Struktur response sudah distandarkan melalui helper `sendSuccess/sendError`, namun ada beberapa endpoint lama yang bisa memiliki format berbeda.
- Untuk detail validasi field, lihat schema pada folder `server/model`.
