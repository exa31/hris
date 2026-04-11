# JMC System

JMC System adalah aplikasi manajemen karyawan berbasis Nuxt yang mencakup autentikasi, manajemen user/role, data pegawai, activity log, dan tunjangan transport.

## 1. Prasyarat

- Node.js 20+
- PostgreSQL 14+
- npm 10+

## 2. Instalasi

```bash
npm install
```

## 3. Setup Environment

Salin file contoh env:

```bash
copy .env.example .env
```

Jika menggunakan shell non-Windows:

```bash
cp .env.example .env
```

Variabel penting yang wajib diisi:

- `NUXT_MODE`
- `NUXT_JWT_SECRET` dan `JWT_SECRET`
- `NUXT_PG_HOST`
- `NUXT_PG_PORT`
- `NUXT_PG_USER`
- `NUXT_PG_PASSWORD`
- `NUXT_PG_DATABASE`
- `NUXT_PUBLIC_API_BASE_URL`

Lihat template lengkap pada file `.env.example`.

## 4. Setup Database

Jalankan migration:

```bash
npm run migrate:up
```

Rollback migration (opsional):

```bash
npm run migrate:down
```

## 5. Menjalankan Aplikasi

Development mode:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview production:

```bash
npm run preview
```

## 6. Dokumentasi API

Dokumentasi API tersedia pada:

- `docs/API_DOCUMENTATION.md`

Dokumentasi login (alur login, validasi, dan akun seeded) tersedia pada:

- `LOGIN_DOCUMENTATION.md`

OpenAPI spec (untuk Swagger Editor):

- `docs/openapi.yaml`

Cara melihat di Swagger Editor:

1. Buka https://editor.swagger.io/
2. Pilih **File > Import File**
3. Upload file `docs/openapi.yaml`

## 7. Dokumentasi Pengujian Aplikasi

Dokumentasi pengujian tersedia pada:

- `docs/TESTING.md`

Dokumen tersebut mencakup:

- Strategi pengujian manual
- Skenario uji API
- Template test case
- Exit criteria sebelum rilis

## 8. Struktur Folder Utama

- `app/` untuk frontend Nuxt (pages, components, composables)
- `server/` untuk API, service, repository, middleware
- `migrations/` untuk migrasi database PostgreSQL
- `docs/` untuk dokumentasi API dan testing

## 9. Catatan Tambahan

- API response umumnya mengikuti format standar `success/message/code/data/timestamp`.
- Autentikasi menggunakan access token + refresh token.
- Otorisasi endpoint tertentu menggunakan middleware permission berbasis role.

## 10. Menjalankan dengan Docker Compose

File compose tersedia di `docker-compose.yml` dan akan menjalankan:

- `app` (Nuxt/Nitro) di port `3000`
- `postgres` di port `10000` (host) -> `5432` (container)

Jalankan service:

```bash
docker compose up -d --build
```

Lihat log:

```bash
docker compose logs -f
```

Stop service:

```bash
docker compose down
```

Stop service + hapus volume database:

```bash
docker compose down -v
```
