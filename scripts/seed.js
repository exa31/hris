/**
 * Nexus HRIS - Comprehensive Seed Script
 * Generates rich organizational data, employees, users, 2 full years (2025-2026)
 * of daily attendance records, leave requests, announcements, and monthly transport allowances.
 *
 * Usage:
 *   node scripts/seed.js
 *   node scripts/seed.js --years=2
 *   node scripts/seed.js --quick (seeds only recent 60 days)
 */

import { query, withTransaction, closePool } from './db.js'

// Hash for default password: P@ssword123 (bcrypt cost 12)
const DEFAULT_PASSWORD_HASH = '$2a$12$0f.OU237cHxB9dPUgHIIweggC52fr0eJKGyztHtg2SFLSTaWvYKqi'

const DEPARTMENTS = [
  'HRD',
  'Engineering & IT',
  'Finance & Accounting',
  'Marketing & Sales',
  'Operations & Logistics',
  'Executive & Board',
]

const POSITIONS = [
  'Director',
  'Manager',
  'Team Lead',
  'Senior Staff',
  'Staf',
  'Magang',
]

const EDUCATIONS = [
  'SMA / SMK',
  'D3 Manajemen Informatika',
  'S1 Teknik Informatika',
  'S1 Sistem Informasi',
  'S1 Manajemen Bisnis',
  'S1 Akuntansi',
  'S1 Psikologi',
  'S1 Ilmu Komunikasi',
  'S2 Magister Manajemen',
]

const EMPLOYEES_DATA = [
  // Existing 3 in initial migration:
  // 1: superadmin (Manager, HRD, Tetap, 8.05km)
  // 2: Siti Nurhaliza (Staf, HRD, Tetap, 2.00km) -> test < 5km rule
  // 3: Ahmad Rahman (Staf, HRD, Kontrak, 5.29km) -> test Kontrak rule (not Tetap)
  {
    nip: 2023001001,
    name: 'Budi Santoso',
    email: 'budi.santoso@company.com',
    phone: '+6281122334455',
    birth_date: '1985-04-12',
    marital_status: 'Married',
    gender: 'Male',
    children_count: 2,
    join_date: '2023-01-10',
    type: 'Tetap',
    department: 'Engineering & IT',
    position: 'Manager',
    distance_km: 14.5,
    role_id: 2, // Manager HRD / Dept Manager
    username: 'budi.santoso',
  },
  {
    nip: 2023001002,
    name: 'Dewi Lestari',
    email: 'dewi.lestari@company.com',
    phone: '+6281233445566',
    birth_date: '1992-08-23',
    marital_status: 'Married',
    gender: 'Female',
    children_count: 1,
    join_date: '2023-03-15',
    type: 'Tetap',
    department: 'Engineering & IT',
    position: 'Team Lead',
    distance_km: 18.2,
    role_id: 4,
    username: 'dewi.lestari',
  },
  {
    nip: 2023001003,
    name: 'Rizky Pratama',
    email: 'rizky.pratama@company.com',
    phone: '+6281344556677',
    birth_date: '1996-11-05',
    marital_status: 'Single',
    gender: 'Male',
    children_count: 0,
    join_date: '2023-06-01',
    type: 'Tetap',
    department: 'Engineering & IT',
    position: 'Senior Staff',
    distance_km: 26.8, // > 25km to test cap
    role_id: 4,
    username: 'rizky.pratama',
  },
  {
    nip: 2024001004,
    name: 'Fajar Nugraha',
    email: 'fajar.nugraha@company.com',
    phone: '+6281455667788',
    birth_date: '1998-02-18',
    marital_status: 'Single',
    gender: 'Male',
    children_count: 0,
    join_date: '2024-01-08',
    type: 'Tetap',
    department: 'Engineering & IT',
    position: 'Staf',
    distance_km: 9.4,
    role_id: 4,
    username: 'fajar.nugraha',
  },
  {
    nip: 2024002001,
    name: 'Anisa Wulandari',
    email: 'anisa.wulandari@company.com',
    phone: '+6281566778899',
    birth_date: '1991-07-30',
    marital_status: 'Married',
    gender: 'Female',
    children_count: 2,
    join_date: '2023-02-01',
    type: 'Tetap',
    department: 'Finance & Accounting',
    position: 'Manager',
    distance_km: 11.0,
    role_id: 2,
    username: 'anisa.wulandari',
  },
  {
    nip: 2024002002,
    name: 'Hendro Prasetyo',
    email: 'hendro.prasetyo@company.com',
    phone: '+6281677889900',
    birth_date: '1994-09-14',
    marital_status: 'Single',
    gender: 'Male',
    children_count: 0,
    join_date: '2023-08-16',
    type: 'Tetap',
    department: 'Finance & Accounting',
    position: 'Senior Staff',
    distance_km: 4.5, // <= 5km (no allowance)
    role_id: 4,
    username: 'hendro.prasetyo',
  },
  {
    nip: 2024002003,
    name: 'Putri Ayu',
    email: 'putri.ayu@company.com',
    phone: '+6281788990011',
    birth_date: '1999-12-03',
    marital_status: 'Single',
    gender: 'Female',
    children_count: 0,
    join_date: '2024-02-15',
    type: 'Kontrak', // Kontrak (no allowance)
    department: 'Finance & Accounting',
    position: 'Staf',
    distance_km: 15.6,
    role_id: 4,
    username: 'putri.ayu',
  },
  {
    nip: 2023003001,
    name: 'Bayu Saputra',
    email: 'bayu.saputra@company.com',
    phone: '+6281899001122',
    birth_date: '1989-03-21',
    marital_status: 'Married',
    gender: 'Male',
    children_count: 1,
    join_date: '2023-04-01',
    type: 'Tetap',
    department: 'Marketing & Sales',
    position: 'Manager',
    distance_km: 21.4,
    role_id: 2,
    username: 'bayu.saputra',
  },
  {
    nip: 2024003002,
    name: 'Citra Kirana',
    email: 'citra.kirana@company.com',
    phone: '+6281900112233',
    birth_date: '1997-05-19',
    marital_status: 'Single',
    gender: 'Female',
    children_count: 0,
    join_date: '2023-11-01',
    type: 'Tetap',
    department: 'Marketing & Sales',
    position: 'Senior Staff',
    distance_km: 31.2, // > 25km cap
    role_id: 4,
    username: 'citra.kirana',
  },
  {
    nip: 2024003003,
    name: 'Dimas Anggara',
    email: 'dimas.anggara@company.com',
    phone: '+6282111223344',
    birth_date: '2000-01-25',
    marital_status: 'Single',
    gender: 'Male',
    children_count: 0,
    join_date: '2024-03-01',
    type: 'Tetap',
    department: 'Marketing & Sales',
    position: 'Staf',
    distance_km: 8.7,
    role_id: 4,
    username: 'dimas.anggara',
  },
  {
    nip: 2023004001,
    name: 'Eko Wahyudi',
    email: 'eko.wahyudi@company.com',
    phone: '+6282222334455',
    birth_date: '1987-10-10',
    marital_status: 'Married',
    gender: 'Male',
    children_count: 3,
    join_date: '2022-11-15',
    type: 'Tetap',
    department: 'Operations & Logistics',
    position: 'Manager',
    distance_km: 16.5,
    role_id: 2,
    username: 'eko.wahyudi',
  },
  {
    nip: 2024004002,
    name: 'Gita Gutawa',
    email: 'gita.gutawa@company.com',
    phone: '+6282333445566',
    birth_date: '1995-06-11',
    marital_status: 'Single',
    gender: 'Female',
    children_count: 0,
    join_date: '2024-01-15',
    type: 'Tetap',
    department: 'Operations & Logistics',
    position: 'Staf',
    distance_km: 19.8,
    role_id: 4,
    username: 'gita.gutawa',
  },
  {
    nip: 2024005001,
    name: 'Iwan Fals',
    email: 'iwan.fals@company.com',
    phone: '+6282444556677',
    birth_date: '1980-09-03',
    marital_status: 'Married',
    gender: 'Male',
    children_count: 2,
    join_date: '2021-01-05',
    type: 'Tetap',
    department: 'Executive & Board',
    position: 'Director',
    distance_km: 12.0,
    role_id: 1, // Super Admin / Exec
    username: 'iwan.fals',
  },
  {
    nip: 2024006001,
    name: 'Kevin Sanjaya',
    email: 'kevin.sanjaya@company.com',
    phone: '+6282555667788',
    birth_date: '2001-08-02',
    marital_status: 'Single',
    gender: 'Male',
    children_count: 0,
    join_date: '2024-04-01',
    type: 'Magang', // Magang (no allowance)
    department: 'Engineering & IT',
    position: 'Magang',
    distance_km: 6.2,
    role_id: 4,
    username: 'kevin.sanjaya',
  },
]

const ANNOUNCEMENTS_DATA = [
  {
    title: 'Pembaruan Kebijakan Jam Kerja & Presensi 2025',
    content: 'Mulai tanggal 2 Januari 2025, seluruh pegawai diwajibkan melakukan pencatatan presensi kehadiran melalui portal Nexus HRIS sebelum pukul 08:30 WIB.',
    priority: 'Important',
    is_active: true,
    created_at: '2025-01-02 08:00:00',
  },
  {
    title: 'Jadwal Cuti Bersama Hari Raya Idul Fitri 1446 H',
    content: 'Manajemen mengumumkan jadwal libur nasional dan cuti bersama Idul Fitri 1446 H. Pelayanan darurat operasional tetap berjalan sesuai jadwal piket.',
    priority: 'Normal',
    is_active: true,
    created_at: '2025-03-20 09:30:00',
  },
  {
    title: 'Evaluasi & Penyesuaian Tunjangan Transportasi Karyawan',
    content: 'Mulai periode Q2 2025, penghitungan tunjangan transportasi dihitung otomatis berdasarkan jumlah hari kerja riil dan jarak domisili karyawan tetap.',
    priority: 'Important',
    is_active: true,
    created_at: '2025-04-10 10:15:00',
  },
  {
    title: 'Program Pelatihan Kompetensi Q3 2025',
    content: 'Divisi HRD membuka pendaftaran program sertifikasi profesional bidang IT, Akuntansi, dan Project Management. Silakan hubungi HRD untuk formulir.',
    priority: 'Normal',
    is_active: true,
    created_at: '2025-07-05 11:00:00',
  },
  {
    title: 'Peringatan Pemeliharaan Server & Database',
    content: 'Akan dilakukan maintenance terjadwal pada infrastruktur cloud database hari Sabtu malam pukul 23:00 - 03:00 WIB. Sistem mungkin tidak dapat diakses sementara.',
    priority: 'Urgent',
    is_active: true,
    created_at: '2025-10-18 14:00:00',
  },
  {
    title: 'Kick-Off Strategis Perusahaan Tahun 2026',
    content: 'Selamat Tahun Baru 2026! Seluruh tim diundang menghadiri Townhall Meeting Awal Tahun pada tanggal 5 Januari 2026 secara hybrid di Auditorium Lantai 3.',
    priority: 'Important',
    is_active: true,
    created_at: '2026-01-03 08:30:00',
  },
  {
    title: 'Penyelenggaraan Medical Check-Up Tahunan 2026',
    content: 'Pemeriksaan kesehatan tahunan (MCU) seluruh karyawan akan diselenggarakan bertahap mulai pekan depan bekerjasama dengan RS Mitra.',
    priority: 'Normal',
    is_active: true,
    created_at: '2026-05-12 09:00:00',
  },
  {
    title: 'Peluncuran Fitur Presensi Otomatis & Log Harian Nexus HRIS',
    content: 'Sistem presensi kini terintegrasi dengan validasi harian otomatis dan sinkronisasi tunjangan transportasi real-time untuk kemudahan administrasi.',
    priority: 'Urgent',
    is_active: true,
    created_at: '2026-08-01 08:00:00',
  },
]

// Business Rounding (<0.5 -> floor, >=0.5 -> ceil)
function businessRound(value) {
  const decimal = value - Math.floor(value)
  return decimal >= 0.5 ? Math.ceil(value) : Math.floor(value)
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function runSeed(options = {}) {
  const startTime = Date.now()
  console.log('🌱 Starting Nexus HRIS comprehensive seed...')

  // 1. Ensure Transport Settings
  await query(`
    INSERT INTO transport_settings (base_fare_per_km, rate_per_day, is_active)
    SELECT 2000, 25000, true
    WHERE NOT EXISTS (SELECT 1 FROM transport_settings);
    UPDATE transport_settings SET base_fare_per_km = 2000, is_active = true WHERE id = 1;
  `)
  console.log('  ✓ Transport settings verified (base_fare: 2000)')

  // 2. Ensure Departments
  for (const deptName of DEPARTMENTS) {
    await query(
      `INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [deptName]
    )
  }
  const deptRows = (await query(`SELECT id, name FROM departments`)).rows
  const deptMap = new Map(deptRows.map((d) => [d.name, d.id]))
  console.log(`  ✓ ${deptRows.length} departments available`)

  // 3. Ensure Positions
  for (const posName of POSITIONS) {
    await query(
      `INSERT INTO positions (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [posName]
    )
  }
  const posRows = (await query(`SELECT id, name FROM positions`)).rows
  const posMap = new Map(posRows.map((p) => [p.name, p.id]))
  console.log(`  ✓ ${posRows.length} positions available`)

  // 4. Ensure Educations
  for (const eduName of EDUCATIONS) {
    const exist = await query(`SELECT 1 FROM educations WHERE name = $1`, [eduName])
    if (exist.rows.length === 0) {
      await query(`INSERT INTO educations (name) VALUES ($1)`, [eduName])
    }
  }
  const eduRows = (await query(`SELECT id, name FROM educations`)).rows
  console.log(`  ✓ ${eduRows.length} educations available`)

  // 5. Ensure Employees & Users
  // Check location district for addresses
  const districtRes = await query(`SELECT id FROM districts LIMIT 1`)
  const defaultDistrictId = districtRes.rows[0]?.id || 1101010

  const regencyRes = await query(`SELECT id FROM regencies LIMIT 1`)
  const defaultRegencyId = regencyRes.rows[0]?.id || 1101

  let newEmpCount = 0
  for (const emp of EMPLOYEES_DATA) {
    const deptId = deptMap.get(emp.department) || deptRows[0].id
    const posId = posMap.get(emp.position) || posRows[0].id

    // Check existing by nip or email
    const existing = await query(
      `SELECT id FROM employees WHERE nip = $1 OR email = $2`,
      [emp.nip, emp.email]
    )

    let employeeId
    if (existing.rows.length === 0) {
      const insRes = await query(
        `INSERT INTO employees (
          nip, name, email, phone, birth_date,
          marital_status, gender, children_count,
          join_date, status, type, birth_place_id,
          department_id, position_id, distance_km
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, true, $10, $11,
          $12, $13, $14
        ) RETURNING id`,
        [
          emp.nip,
          emp.name,
          emp.email,
          emp.phone,
          emp.birth_date,
          emp.marital_status,
          emp.gender,
          emp.children_count,
          emp.join_date,
          emp.type,
          defaultRegencyId,
          deptId,
          posId,
          emp.distance_km,
        ]
      )
      employeeId = insRes.rows[0].id
      newEmpCount++

      // Address
      await query(
        `INSERT INTO employee_addresses (employee_id, district_id, full_address)
         VALUES ($1, $2, $3)`,
        [
          employeeId,
          defaultDistrictId,
          `Jl. Mawar No. ${randomBetween(1, 100)}, RT 0${randomBetween(1, 9)} / RW 0${randomBetween(1, 9)}`,
        ]
      )

      // Education
      const randomEduId = eduRows[randomBetween(0, eduRows.length - 1)].id
      await query(
        `INSERT INTO employee_educations (employee_id, education_id)
         VALUES ($1, $2)`,
        [employeeId, randomEduId]
      )
    } else {
      employeeId = existing.rows[0].id
      // Update distance_km if needed
      await query(
        `UPDATE employees SET distance_km = $1 WHERE id = $2 AND distance_km IS NULL`,
        [emp.distance_km, employeeId]
      )
    }

    // Ensure User account
    const userExist = await query(
      `SELECT id FROM users WHERE employee_id = $1 OR username = $2`,
      [employeeId, emp.username]
    )
    if (userExist.rows.length === 0) {
      await query(
        `INSERT INTO users (employee_id, username, password_hash, role_id, is_active)
         VALUES ($1, $2, $3, $4, true)`,
        [employeeId, emp.username, DEFAULT_PASSWORD_HASH, emp.role_id]
      )
    }
  }

  // Fix sequences
  await query(`
    SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees), true);
    SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), true);
  `)

  const allEmployeesRes = await query(`
    SELECT id, name, type, join_date, COALESCE(distance_km, 10) as distance_km
    FROM employees
    WHERE status = true AND deleted_at IS NULL
    ORDER BY id ASC
  `)
  const activeEmployees = allEmployeesRes.rows
  console.log(`  ✓ Total active employees: ${activeEmployees.length} (${newEmpCount} newly added)`)

  // 6. Announcements
  const adminUserRes = await query(`SELECT id FROM users WHERE role_id = 1 LIMIT 1`)
  const adminUserId = adminUserRes.rows[0]?.id || 1

  for (const ann of ANNOUNCEMENTS_DATA) {
    const exist = await query(`SELECT 1 FROM announcements WHERE title = $1`, [ann.title])
    if (exist.rows.length === 0) {
      await query(
        `INSERT INTO announcements (title, content, priority, is_active, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::timestamp, $6::timestamp)`,
        [ann.title, ann.content, ann.priority, ann.is_active, adminUserId, ann.created_at]
      )
    }
  }
  console.log(`  ✓ ${ANNOUNCEMENTS_DATA.length} announcements seeded`)

  // 7. Leave Requests across 2025 and 2026
  const leaveTypesRes = await query(`SELECT id, name, max_days FROM leave_types ORDER BY id`)
  const leaveTypes = leaveTypesRes.rows

  // Generate varied sample leave requests
  const sampleLeaves = [
    // 2025 Leaves
    { empIdx: 1, typeId: 1, start: '2025-02-10', end: '2025-02-12', days: 3, reason: 'Liburan keluarga ke Yogyakarta', status: 'Approved' },
    { empIdx: 2, typeId: 2, start: '2025-03-05', end: '2025-03-06', days: 2, reason: 'Demam tinggi & flu', status: 'Approved' },
    { empIdx: 3, typeId: 4, start: '2025-04-14', end: '2025-04-15', days: 2, reason: 'Acara pernikahan saudara kandung', status: 'Approved' },
    { empIdx: 4, typeId: 1, start: '2025-06-18', end: '2025-06-20', days: 3, reason: 'Cuti mudik pertengahan tahun', status: 'Approved' },
    { empIdx: 5, typeId: 1, start: '2025-08-25', end: '2025-08-27', days: 3, reason: 'Keperluan renovasi rumah', status: 'Rejected', rejection: 'Beban kerja tim finance sedang tinggi untuk closing bulanan' },
    { empIdx: 6, typeId: 2, start: '2025-09-10', end: '2025-09-11', days: 2, reason: 'Radang tenggorokan', status: 'Approved' },
    { empIdx: 7, typeId: 1, start: '2025-11-03', end: '2025-11-07', days: 5, reason: 'Wisata akhir tahun', status: 'Approved' },
    { empIdx: 8, typeId: 2, start: '2025-12-15', end: '2025-12-16', days: 2, reason: 'Pemeriksaan gigi', status: 'Approved' },

    // 2026 Leaves
    { empIdx: 1, typeId: 1, start: '2026-01-19', end: '2026-01-21', days: 3, reason: 'Cuti istirahat awal tahun', status: 'Approved' },
    { empIdx: 2, typeId: 2, start: '2026-02-12', end: '2026-02-13', days: 2, reason: 'Tipes ringan (istirahat dokter)', status: 'Approved' },
    { empIdx: 3, typeId: 4, start: '2026-03-02', end: '2026-03-03', days: 2, reason: 'Urusan sertifikat tanah', status: 'Approved' },
    { empIdx: 5, typeId: 1, start: '2026-04-20', end: '2026-04-24', days: 5, reason: 'Cuti tahunan Idul Fitri', status: 'Approved' },
    { empIdx: 6, typeId: 1, start: '2026-06-15', end: '2026-06-17', days: 3, reason: 'Liburan bersama anak', status: 'Approved' },
    { empIdx: 7, typeId: 2, start: '2026-07-08', end: '2026-07-09', days: 2, reason: 'Sakit lambung / maag', status: 'Approved' },
    { empIdx: 8, typeId: 1, start: '2026-08-10', end: '2026-08-12', days: 3, reason: 'Cuti pribadi', status: 'Approved' },
    { empIdx: 9, typeId: 1, start: '2026-09-22', end: '2026-09-25', days: 4, reason: 'Rencana liburan keluarga', status: 'Pending' },
    { empIdx: 10, typeId: 4, start: '2026-09-28', end: '2026-09-29', days: 2, reason: 'Keperluan dinas / seminar', status: 'Pending' },
  ]

  const approvedLeaveDates = new Map() // key: employeeId_YYYY-MM-DD -> leave name

  for (const item of sampleLeaves) {
    const emp = activeEmployees[item.empIdx % activeEmployees.length]
    if (!emp) continue

    const exist = await query(
      `SELECT id FROM leave_requests WHERE employee_id = $1 AND start_date = $2`,
      [emp.id, item.start]
    )
    if (exist.rows.length === 0) {
      await query(
        `INSERT INTO leave_requests (
          employee_id, leave_type_id, start_date, end_date,
          total_days, reason, status, approved_by, rejection_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          emp.id,
          item.typeId,
          item.start,
          item.end,
          item.days,
          item.reason,
          item.status,
          item.status === 'Approved' ? adminUserId : null,
          item.rejection || null,
        ]
      )
    }

    if (item.status === 'Approved') {
      const cur = new Date(item.start)
      const endD = new Date(item.end)
      const leaveTypeObj = leaveTypes.find((t) => t.id === item.typeId)
      const typeName = leaveTypeObj ? leaveTypeObj.name : 'Cuti'

      while (cur <= endD) {
        const dStr = formatDate(cur)
        approvedLeaveDates.set(`${emp.id}_${dStr}`, typeName)
        cur.setDate(cur.getDate() + 1)
      }
    }
  }
  console.log(`  ✓ Leave requests seeded & indexed (${approvedLeaveDates.size} approved leave dates mapped)`)

  // 8. 2 FULL YEARS ATTENDANCE HISTORY (2025-01-01 to Current Date: 2026-09-16)
  const isQuick = options.quick === true
  const startDate = isQuick ? new Date('2026-07-01') : new Date('2025-01-01')
  const endDate = new Date('2026-09-16')

  console.log(`  ⏳ Generating historical attendances from ${formatDate(startDate)} to ${formatDate(endDate)}...`)

  const attendanceBatch = []
  let totalWorkdays = 0

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    // Skip Saturdays (6) and Sundays (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      totalWorkdays++
      const dateStr = formatDate(currentDate)

      for (const emp of activeEmployees) {
        // Skip if employee had not joined yet
        const empJoinDate = new Date(emp.join_date)
        if (empJoinDate > currentDate) {
          continue
        }

        const leaveKey = `${emp.id}_${dateStr}`
        const approvedLeave = approvedLeaveDates.get(leaveKey)

        if (approvedLeave) {
          // Employee has an approved leave for this date
          attendanceBatch.push({
            employee_id: emp.id,
            date: dateStr,
            clock_in: null,
            clock_out: null,
            status: 'Izin',
            notes: `Cuti Disetujui: ${approvedLeave}`,
          })
          continue
        }

        // Realistic attendance distribution
        const rand = Math.random()
        if (rand < 0.89) {
          // 89% HADIR
          const inHour = 7
          const inMin = randomBetween(40, 58)
          const isLate = Math.random() < 0.08 // 8% chance slightly late
          const actualInHour = isLate ? 8 : inHour
          const actualInMin = isLate ? randomBetween(31, 45) : inMin
          const clockIn = `${String(actualInHour).padStart(2, '0')}:${String(actualInMin).padStart(2, '0')}:00`

          const outHour = randomBetween(17, 18)
          const outMin = randomBetween(0, 45)
          const clockOut = `${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`

          const notes = isLate ? `Terlambat (${actualInHour}:${actualInMin})` : 'Hadir tepat waktu'

          attendanceBatch.push({
            employee_id: emp.id,
            date: dateStr,
            clock_in: clockIn,
            clock_out: clockOut,
            status: 'Hadir',
            notes,
          })
        } else if (rand < 0.94) {
          // 5% IZIN
          attendanceBatch.push({
            employee_id: emp.id,
            date: dateStr,
            clock_in: null,
            clock_out: null,
            status: 'Izin',
            notes: 'Izin keperluan keluarga mendesak',
          })
        } else if (rand < 0.98) {
          // 4% SAKIT
          attendanceBatch.push({
            employee_id: emp.id,
            date: dateStr,
            clock_in: null,
            clock_out: null,
            status: 'Sakit',
            notes: 'Sakit (surat keterangan dokter terlampir)',
          })
        } else {
          // 2% ALPHA
          attendanceBatch.push({
            employee_id: emp.id,
            date: dateStr,
            clock_in: null,
            clock_out: null,
            status: 'Alpha',
            notes: 'Tanpa keterangan',
          })
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  console.log(`  ✓ Prepared ${attendanceBatch.length} attendance records across ${totalWorkdays} workdays`)

  // Bulk insert in chunks of 500 records
  const CHUNK_SIZE = 500
  let insertedAttendances = 0

  for (let i = 0; i < attendanceBatch.length; i += CHUNK_SIZE) {
    const chunk = attendanceBatch.slice(i, i + CHUNK_SIZE)
    const values = []
    const placeholders = []
    let pCount = 1

    for (const r of chunk) {
      placeholders.push(`($${pCount}, $${pCount + 1}, $${pCount + 2}, $${pCount + 3}, $${pCount + 4}, $${pCount + 5})`)
      values.push(r.employee_id, r.date, r.clock_in, r.clock_out, r.status, r.notes)
      pCount += 6
    }

    const res = await query(
      `INSERT INTO attendances (employee_id, date, clock_in, clock_out, status, notes)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT (employee_id, date) DO NOTHING`,
      values
    )
    insertedAttendances += res.rowCount || 0
  }

  console.log(`  ✓ Inserted/retained ${insertedAttendances} attendance records in database`)

  // 9. 2 FULL YEARS MONTHLY TRANSPORT ALLOWANCES (2025-01 to 2026-09)
  console.log('  ⏳ Calculating and inserting monthly transport allowances (2025-2026)...')

  const baseFare = 2000
  const MIN_WORKING_DAYS = 19
  const MIN_DISTANCE_KM = 5
  const MAX_DISTANCE_KM = 25

  let totalAllowancesInserted = 0

  // Month ranges: 2025 (1-12) & 2026 (1-9)
  const periods = []
  if (!isQuick) {
    for (let m = 1; m <= 12; m++) periods.push({ year: 2025, month: m })
  }
  for (let m = 1; m <= 9; m++) periods.push({ year: 2026, month: m })

  for (const { year, month } of periods) {
    // Count 'Hadir' days for this month
    const workDaysRes = await query(
      `SELECT e.id as employee_id, e.type, COALESCE(e.distance_km, 10) as distance_km,
              COUNT(a.id) as working_days
       FROM employees e
       LEFT JOIN attendances a ON a.employee_id = e.id
                              AND EXTRACT(MONTH FROM a.date) = $1
                              AND EXTRACT(YEAR FROM a.date) = $2
                              AND a.status = 'Hadir'
       WHERE e.status = true AND e.deleted_at IS NULL
       GROUP BY e.id, e.type, e.distance_km`,
      [month, year]
    )

    const allowanceRecords = []

    for (const emp of workDaysRes.rows) {
      const workingDays = parseInt(emp.working_days, 10) || 0
      const distanceKm = parseFloat(emp.distance_km) || 0
      const empType = emp.type

      let calculatedKm = 0
      let amount = 0

      // Business Rules:
      // 1. Employee type must be "Tetap"
      // 2. working_days >= 19
      // 3. distance_km > 5
      // 4. cap distance at 25
      // 5. business rounding
      if (empType === 'Tetap' && workingDays >= MIN_WORKING_DAYS && distanceKm > MIN_DISTANCE_KM) {
        const effectiveKm = distanceKm > MAX_DISTANCE_KM ? MAX_DISTANCE_KM : distanceKm
        calculatedKm = businessRound(effectiveKm)
        amount = baseFare * calculatedKm * workingDays
      }

      allowanceRecords.push({
        employee_id: emp.employee_id,
        month,
        year,
        base_fare: baseFare,
        distance_km: distanceKm,
        calculated_km: calculatedKm,
        working_days: workingDays,
        amount,
        total_allowance: amount,
      })
    }

    // Upsert allowanceRecords
    if (allowanceRecords.length > 0) {
      const values = []
      const placeholders = []
      let pCount = 1

      for (const r of allowanceRecords) {
        placeholders.push(
          `($${pCount}, $${pCount + 1}, $${pCount + 2}, $${pCount + 3}, $${pCount + 4}, $${pCount + 5}, $${pCount + 6}, $${pCount + 7}, $${pCount + 8}, NOW())`
        )
        values.push(
          r.employee_id,
          r.month,
          r.year,
          r.base_fare,
          r.distance_km,
          r.calculated_km,
          r.working_days,
          r.amount,
          r.total_allowance
        )
        pCount += 9
      }

      const res = await query(
        `INSERT INTO transport_allowances (
          employee_id, month, year, base_fare, distance_km,
          calculated_km, working_days, amount, total_allowance, generated_at
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (employee_id, month, year) DO UPDATE SET
          working_days = EXCLUDED.working_days,
          distance_km = EXCLUDED.distance_km,
          calculated_km = EXCLUDED.calculated_km,
          amount = EXCLUDED.amount,
          total_allowance = EXCLUDED.total_allowance,
          generated_at = NOW()`,
        values
      )
      totalAllowancesInserted += res.rowCount || 0
    }
  }

  console.log(`  ✓ Upserted ${totalAllowancesInserted} transport allowance records across ${periods.length} months`)

  // 10. Record Activity Log
  await query(
    `INSERT INTO activity_logs (user_id, action, module, description, metadata, created_at)
     VALUES ($1, 'SEED_DATABASE', 'system', 'Seeded 2-year historical HRIS dataset', $2, NOW())`,
    [
      adminUserId,
      JSON.stringify({
        employees: activeEmployees.length,
        attendances: attendanceBatch.length,
        months_covered: periods.length,
        execution_ms: Date.now() - startTime,
      }),
    ]
  )

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\n🎉 Seed completed successfully in ${durationSec}s!`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`  • Departments:       ${deptRows.length}`)
  console.log(`  • Positions:         ${posRows.length}`)
  console.log(`  • Active Employees:  ${activeEmployees.length}`)
  console.log(`  • Announcements:     ${ANNOUNCEMENTS_DATA.length}`)
  console.log(`  • Workday History:   ${totalWorkdays} days (2025 - 2026)`)
  console.log(`  • Total Attendances: ~${attendanceBatch.length} records`)
  console.log(`  • Allowance Periods: ${periods.length} months`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

// Execute when run directly via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  const isQuick = process.argv.includes('--quick')
  runSeed({ quick: isQuick })
    .then(async () => {
      await closePool()
      process.exit(0)
    })
    .catch(async (err) => {
      console.error('❌ Seed failed:', err)
      await closePool()
      process.exit(1)
    })
}
