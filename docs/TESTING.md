# Dokumentasi Pengujian Aplikasi JMC

Dokumen ini menjelaskan strategi pengujian untuk aplikasi JMC (frontend Nuxt + server API).

## Tujuan Pengujian

- Memastikan fitur utama berjalan sesuai requirement.
- Memastikan autentikasi, otorisasi, dan validasi data aman.
- Mencegah regresi saat ada perubahan fitur.

## Ruang Lingkup

- Login, refresh token, logout
- Manajemen user, role, dan permission
- Manajemen pegawai
- Pendidikan pegawai
- Transport allowance dan settings
- Export PDF/Excel
- Upload file gambar

## Jenis Pengujian yang Direkomendasikan

### 1. Pengujian Manual (Functional Testing)

Dilakukan melalui UI dan/atau Postman.

Checklist inti:

- [ ] Login valid menghasilkan akses ke dashboard.
- [ ] Login invalid menampilkan error yang benar.
- [ ] Token expired dapat diperbarui melalui refresh token.
- [ ] User tanpa permission mendapatkan status 403.
- [ ] CRUD user berjalan normal (create, read, update, delete).
- [ ] CRUD pegawai berjalan normal.
- [ ] Upload hanya menerima JPG/PNG/WEBP dan menolak file > 2MB.
- [ ] Generate transport allowance menghasilkan data sesuai periode.
- [ ] Export PDF/Excel dapat diunduh dan terbaca.
- [ ] Activity log tercatat untuk aksi penting (login, create, update, delete).

### 2. Pengujian API (Postman / Swagger)

Gunakan file:
- `docs/openapi.yaml` (import ke Swagger Editor)
- `docs/API_DOCUMENTATION.md` (panduan endpoint)

Skenario minimal per endpoint:

- Happy path: request valid, response 2xx.
- Validation path: payload tidak valid, response 400.
- Auth path: tanpa token, response 401.
- Permission path: role tidak punya akses, response 403.
- Not found path: id tidak ditemukan, response 404.

### 3. Pengujian Database dan Migrasi

Sebelum test:

1. Jalankan migration up.
2. Pastikan seed data tersedia.
3. Verifikasi tabel inti: users, roles, employees, permissions, role_permissions, refresh_tokens, transport_allowances.

Contoh command:

```bash
npm run migrate:up
```

Rollback saat diperlukan:

```bash
npm run migrate:down
```

## Rekomendasi Otomasi (Opsional)

Proyek saat ini belum memiliki script test otomatis di package.json.

Rekomendasi bertahap:

1. Unit test service/repository dengan Vitest.
2. API integration test endpoint kritikal (auth, users, employees).
3. E2E smoke test alur login -> akses dashboard -> logout.

Contoh target minimum coverage:

- Unit + integration coverage >= 70% untuk modul kritikal.

## Template Test Case (Format Bebas)

### TC-AUTH-001: Login Berhasil

- Precondition: user aktif tersedia di database.
- Step:
  1. Kirim POST /api/auth/credentials dengan username/password valid.
- Expected:
  1. Status 200.
  2. `success=true`.
  3. `data.accessToken` terisi.
  4. Cookie refresh token terpasang.

### TC-AUTH-002: Login Gagal

- Precondition: user ada.
- Step:
  1. Kirim POST /api/auth/credentials dengan password salah.
- Expected:
  1. Status 401.
  2. `success=false` atau kode error valid sesuai implementasi.

### TC-USER-001: Create User Berhasil

- Precondition: login sebagai role dengan permission `users:create`.
- Step:
  1. Kirim POST /api/users/index dengan payload valid.
- Expected:
  1. Status 201.
  2. Data user baru tersimpan.

### TC-EMP-001: Filter Pegawai

- Precondition: data pegawai tersedia.
- Step:
  1. Kirim GET /api/employees/index dengan query `limit`, `offset`, dan `search`.
- Expected:
  1. Status 200.
  2. Data ter-filter sesuai query.

### TC-UPLOAD-001: Upload Gambar Valid

- Precondition: login valid.
- Step:
  1. Kirim POST /api/upload multipart dengan field `file` bertipe PNG < 2MB.
- Expected:
  1. Status 200.
  2. Response berisi `url` file upload.

## Exit Criteria (Release Ready)

Aplikasi dinyatakan siap rilis jika:

- Seluruh test case P1/P2 lulus.
- Tidak ada bug blocker/critical terbuka.
- Endpoint auth dan permission tervalidasi.
- Proses migration pada environment target berhasil.

## Catatan

- Dokumentasi ini bersifat living document, perlu diperbarui setiap ada endpoint/fitur baru.
