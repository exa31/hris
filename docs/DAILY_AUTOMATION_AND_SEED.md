# 🚀 Nexus HRIS - Data Seeding & Daily Automation Guide

Dokumentasi lengkap mengenai **Seed Data (Historis 2 Tahun)**, **Daily Data Automation Engine**, dan **CI/CD Scheduled Pipeline** untuk Nexus HRIS.

---

## 1. Master Seed Data (Historis 2 Tahun)

Script master seed dirancang untuk mengisi database HRIS dengan data yang padat, realistis, dan mencakup **2 tahun penuh riwayat absensi & tunjangan transport (2025–2026)**.

### Fitur yang Dibuat:
- **Departemen & Posisi Lengkap**: 6 departemen organisasi (HRD, IT & Engineering, Finance, Marketing, Operations, Executive) dan 6 jenjang jabatan.
- **17 Pegawai Realistis**: Beragam tipe kontrak (`Tetap`, `Kontrak`, `Magang`), jenis kelamin, alamat domisili, pendidikan, serta jarak tempuh domisili (`distance_km` bervariasi: < 5km, 5–25km, > 25km).
- **Akun Pengguna (Users)**: Terhubung ke role Super Admin, Manager HRD, Admin HRD, dan Pegawai.
  - **Password Default**: `P@ssword123`
- **Pengumuman Perusahaan**: 8 pengumuman dengan berbagai prioritas (`Normal`, `Important`, `Urgent`).
- **Pengajuan Cuti**: Puluhan pengajuan cuti historis (`Approved`, `Pending`, `Rejected`).
- **7.500+ Catatan Absensi Historis (2025–2026)**:
  - Mengikuti kalender hari kerja (Senin–Jumat).
  - Sinkron otomatis dengan cuti yang telah disetujui (`status = Izin`).
  - Distribusi kehadiran realistis (~89% Hadir dengan clock-in/out, ~5% Izin, ~4% Sakit, ~2% Alpha).
- **21 Bulan Tunjangan Transportasi (2025–2026)**:
  - Dihitung otomatis sesuai business rule resmi perusahaan.

### Menjalankan Seed Secara Lokal:

```bash
# Menggunakan npm script
npm run seed

# Atau langsung via node
node scripts/seed.js

# Mode cepat (hanya seed 2-3 bulan terakhir)
node scripts/seed.js --quick
```

Script ini **idempotent** (aman dijalankan berulang kali tanpa membuat data ganda atau error constraint).

---

## 2. Daily Data Automation Engine

Script `scripts/daily-automation.js` berfungsi mencatat presensi harian otomatis untuk seluruh karyawan aktif dan menyinkronkan tunjangan transport bulanan.

### Alur Kerja Harian:
1. **Pengecekan Hari Libur**: Otomatis melewati (skip) hari Sabtu & Minggu (kecuali dipaksa dengan `--include-weekends`).
2. **Pengecekan Cuti Disetujui**: Karyawan dengan cuti yang telah di-approve pada tanggal tersebut otomatis dicatat sebagai `Izin` dengan catatan nama cuti terkait.
3. **Simulasi Kehadiran Realistis**:
   - **Hadir (~88%)**: Jam masuk (07:35–08:45), deteksi keterlambatan jika > 08:30 WIB, jam pulang (17:00–18:35).
   - **Izin (~6%)**: Tanpa clock-in/out, catatan izin keluarga.
   - **Sakit (~4%)**: Tanpa clock-in/out, catatan surat dokter.
   - **Alpha (~2%)**: Tanpa keterangan.
4. **Sinkronisasi Tunjangan Transportasi**: Otomatis memperbarui akumulasi hari kerja (`Hadir`) dan nominal tunjangan karyawan untuk bulan berjalan.
5. **Pencatatan Log Audit**: Menyimpan log eksekusi otomatis ke tabel `activity_logs`.

### Opsi CLI Daily Automation:

| Opsi | Deskripsi | Contoh |
| :--- | :--- | :--- |
| *(tanpa opsi)* | Memproses tanggal hari ini (WIB / UTC+7) | `npm run daily:run` |
| `--date=YYYY-MM-DD` | Memproses tanggal tertentu | `node scripts/daily-automation.js --date=2026-09-17` |
| `--days=N` | Memproses mundur N hari (backfill) | `node scripts/daily-automation.js --days=7` |
| `--from=... --to=...` | Memproses rentang tanggal | `node scripts/daily-automation.js --from=2026-09-01 --to=2026-09-15` |
| `--force` | Timpa data absensi yang sudah ada | `node scripts/daily-automation.js --force` |
| `--sync-transport` | Sinkronkan tunjangan transport bulan terkait (default) | `npm run daily:sync` |
| `--no-transport` | Lewati sinkronisasi tunjangan transport | `node scripts/daily-automation.js --no-transport` |
| `--include-weekends` | Tetap proses meskipun hari Sabtu / Minggu | `node scripts/daily-automation.js --include-weekends` |
| `--dry-run` | Simulasi tanpa menulis perubahan ke database | `node scripts/daily-automation.js --dry-run` |

---

## 3. Otomasi di CI/CD (GitHub Actions)

File workflow berada di: [`.github/workflows/daily-automation.yml`](file:///.github/workflows/daily-automation.yml).

### A. Jadwal Otomatis (Cron)
Workflow dijadwalkan berjalan **Senin s.d. Jumat pukul 11:00 UTC (18:00 WIB)**, tepat setelah jam kantor selesai:
```yaml
schedule:
  - cron: '0 11 * * 1-5'
```

### B. Trigger Manual (`workflow_dispatch`)
Bisa dijalankan kapan saja melalui antarmuka GitHub Actions:
1. Buka repository di GitHub -> tab **Actions**.
2. Pilih workflow **Daily HRIS Automation & Sync**.
3. Klik **Run workflow**.
4. Isi parameter opsional:
   - `date`: Tanggal spesifik (kosongkan untuk hari ini).
   - `run_seed`: Centang jika ingin menjalankan master seed database terlebih dahulu.
   - `sync_transport`: Sinkronkan tunjangan transport (default: `true`).
   - `force`: Timpa absensi jika sudah ada (default: `false`).

### C. Arsitektur API untuk Database dengan Strict IP
Jika PostgreSQL Anda berada di balik firewall dengan **Strict IP whitelisting** (sehingga GitHub Actions runner tidak dapat terhubung langsung ke port 5432), sistem secara otomatis menggunakan jalur **API Endpoint (`/api/automation/daily`)**.

Jalur API ini memanggil server HRIS (`https://hris.eka-dev.cloud`) yang berada di jaringan internal cluster yang sama dengan database.

Variabel di GitHub Actions:
- `API_URL`: URL live aplikasi (default: `https://hris.eka-dev.cloud`)
- `AUTOMATION_SECRET`: Secret token untuk otentikasi API (disinkronkan dengan `NUXT_JWT_SECRET` / `AUTOMATION_SECRET`)
- `DATABASE_URL` *(opsional)*: Jika disediakan, CLI juga dapat mengeksekusi langsung via PostgreSQL.

---

## 4. Aturan Bisnis Tunjangan Transportasi

Tunjangan transportasi dihitung berdasarkan ketentuan:
1. **Status Karyawan**: Hanya karyawan dengan status `Tetap` yang berhak mendapatkan tunjangan.
2. **Kehadiran Minimum**: Minimal `19 hari kerja` (status `Hadir`) dalam bulan tersebut.
3. **Jarak Domisili**:
   - Jarak $\le 5\text{ km} \rightarrow \text{Tunjangan} = 0$.
   - Jarak $> 25\text{ km} \rightarrow \text{Dibatasi (cap) maksimal } 25\text{ km}$.
   - Pembulatan matematis bisnis: Desimal $\ge 0.5 \rightarrow$ dibulatkan ke atas, $< 0.5 \rightarrow$ ke bawah.
4. **Rumus Perhitungan**:
   $$\text{Tunjangan} = \text{Base Fare (Rp 2.000)} \times \text{Jarak (km)} \times \text{Hari Kerja}$$
