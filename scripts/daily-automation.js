/**
 * Nexus HRIS - Daily Data Automation Engine
 * Automates daily attendance logging, approved leave synchronization,
 * and monthly transport allowance recalculation.
 *
 * Suitable for CI/CD scheduled runs (GitHub Actions, GitLab CI, VPS cron).
 *
 * Options:
 *   --date=YYYY-MM-DD      Run for specific date (defaults to today in WIB / UTC+7)
 *   --days=N               Backfill for the last N days (e.g. --days=7)
 *   --from=... --to=...    Backfill for a specific date range
 *   --include-weekends     Include Saturdays and Sundays (default: false)
 *   --force                Overwrite existing attendance records for the date
 *   --no-transport         Skip automatic transport allowance sync
 *   --dry-run              Simulate execution without saving changes to DB
 *
 * Examples:
 *   node scripts/daily-automation.js
 *   node scripts/daily-automation.js --date=2026-09-16
 *   node scripts/daily-automation.js --days=3 --force
 */

import { query, closePool } from './db.js'

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    date: null,
    days: 1,
    from: null,
    to: null,
    includeWeekends: false,
    force: false,
    syncTransport: true,
    dryRun: false,
    useApi: false,
    directDb: false,
  }

  for (const arg of args) {
    if (arg.startsWith('--date=')) {
      options.date = arg.split('=')[1]
    } else if (arg.startsWith('--days=')) {
      options.days = parseInt(arg.split('=')[1], 10) || 1
    } else if (arg.startsWith('--from=')) {
      options.from = arg.split('=')[1]
    } else if (arg.startsWith('--to=')) {
      options.to = arg.split('=')[1]
    } else if (arg === '--include-weekends') {
      options.includeWeekends = true
    } else if (arg === '--force') {
      options.force = true
    } else if (arg === '--no-transport') {
      options.syncTransport = false
    } else if (arg === '--sync-transport') {
      options.syncTransport = true
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--api') {
      options.useApi = true
    } else if (arg === '--direct-db') {
      options.directDb = true
    }
  }

  return options
}

function getTodayWIB() {
  const now = new Date()
  // Asia/Jakarta is UTC+7
  const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  return formatDate(wibTime)
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function businessRound(value) {
  const decimal = value - Math.floor(value)
  return decimal >= 0.5 ? Math.ceil(value) : Math.floor(value)
}

async function syncMonthlyTransportAllowances(month, year, dryRun = false) {
  const MIN_WORKING_DAYS = 19
  const MIN_DISTANCE_KM = 5
  const MAX_DISTANCE_KM = 25

  // Get active base fare
  const settingRes = await query(`
    SELECT base_fare_per_km FROM transport_settings WHERE is_active = true ORDER BY id ASC LIMIT 1
  `)
  const baseFare = parseFloat(settingRes.rows[0]?.base_fare_per_km || 2000)

  // Count working days (Hadir) per employee
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

  const records = []
  let eligibleCount = 0

  for (const emp of workDaysRes.rows) {
    const workingDays = parseInt(emp.working_days, 10) || 0
    const distanceKm = parseFloat(emp.distance_km) || 0
    const empType = emp.type

    let calculatedKm = 0
    let amount = 0

    if (empType === 'Tetap' && workingDays >= MIN_WORKING_DAYS && distanceKm > MIN_DISTANCE_KM) {
      const effectiveKm = distanceKm > MAX_DISTANCE_KM ? MAX_DISTANCE_KM : distanceKm
      calculatedKm = businessRound(effectiveKm)
      amount = baseFare * calculatedKm * workingDays
      eligibleCount++
    }

    records.push({
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

  if (dryRun) {
    console.log(`    [Dry-Run] Would sync transport allowances for ${records.length} employees (${eligibleCount} eligible) for ${month}/${year}`)
    return records.length
  }

  if (records.length > 0) {
    const values = []
    const placeholders = []
    let pCount = 1

    for (const r of records) {
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

    await query(
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
  }

  return records.length
}

async function processDate(targetDateStr, options) {
  const targetDate = new Date(targetDateStr)
  const dayOfWeek = targetDate.getDay() // 0: Sun, 6: Sat
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if ((dayOfWeek === 0 || dayOfWeek === 6) && !options.includeWeekends) {
    console.log(`  ⏩ Skipping ${targetDateStr} (${dayNames[dayOfWeek]}) - Weekend. Use --include-weekends to force.`)
    return { date: targetDateStr, skipped: true, reason: 'weekend' }
  }

  // 1. Fetch active employees
  const employeesRes = await query(`
    SELECT id, name, type, join_date
    FROM employees
    WHERE status = true AND deleted_at IS NULL AND join_date <= $1
    ORDER BY id ASC
  `, [targetDateStr])
  const employees = employeesRes.rows

  if (employees.length === 0) {
    console.log(`  ⚠️  No active employees found for date ${targetDateStr}`)
    return { date: targetDateStr, skipped: true, reason: 'no_employees' }
  }

  // 2. Fetch approved leaves for this date
  const leavesRes = await query(`
    SELECT lr.employee_id, lt.name as leave_type_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.status = 'Approved'
      AND lr.start_date <= $1
      AND lr.end_date >= $1
  `, [targetDateStr])

  const leaveMap = new Map()
  for (const row of leavesRes.rows) {
    leaveMap.set(row.employee_id, row.leave_type_name)
  }

  // 3. Check existing attendances for this date
  const existingAttRes = await query(`
    SELECT employee_id FROM attendances WHERE date = $1
  `, [targetDateStr])
  const existingEmployeeIds = new Set(existingAttRes.rows.map((r) => r.employee_id))

  const recordsToInsert = []
  let hadirCount = 0
  let izinCount = 0
  let sakitCount = 0
  let alphaCount = 0

  for (const emp of employees) {
    if (existingEmployeeIds.has(emp.id) && !options.force) {
      continue
    }

    const approvedLeave = leaveMap.get(emp.id)

    if (approvedLeave) {
      recordsToInsert.push({
        employee_id: emp.id,
        date: targetDateStr,
        clock_in: null,
        clock_out: null,
        status: 'Izin',
        notes: `Cuti Disetujui: ${approvedLeave}`,
      })
      izinCount++
      continue
    }

    // Realistic probabilistic attendance simulation
    const rand = Math.random()
    if (rand < 0.88) {
      // 88% Hadir
      const isLate = Math.random() < 0.08
      const inHour = isLate ? 8 : 7
      const inMin = isLate ? randomBetween(31, 45) : randomBetween(40, 58)
      const clockIn = `${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`

      const outHour = randomBetween(17, 18)
      const outMin = randomBetween(0, 45)
      const clockOut = `${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`

      const notes = isLate ? `Terlambat (${inHour}:${inMin})` : 'Hadir tepat waktu'

      recordsToInsert.push({
        employee_id: emp.id,
        date: targetDateStr,
        clock_in: clockIn,
        clock_out: clockOut,
        status: 'Hadir',
        notes,
      })
      hadirCount++
    } else if (rand < 0.94) {
      // 6% Izin
      recordsToInsert.push({
        employee_id: emp.id,
        date: targetDateStr,
        clock_in: null,
        clock_out: null,
        status: 'Izin',
        notes: 'Izin keperluan mendesak',
      })
      izinCount++
    } else if (rand < 0.98) {
      // 4% Sakit
      recordsToInsert.push({
        employee_id: emp.id,
        date: targetDateStr,
        clock_in: null,
        clock_out: null,
        status: 'Sakit',
        notes: 'Sakit (surat dokter terlampir)',
      })
      sakitCount++
    } else {
      // 2% Alpha
      recordsToInsert.push({
        employee_id: emp.id,
        date: targetDateStr,
        clock_in: null,
        clock_out: null,
        status: 'Alpha',
        notes: 'Tanpa keterangan',
      })
      alphaCount++
    }
  }

  if (recordsToInsert.length === 0) {
    console.log(`  ℹ️  All ${employees.length} employees already have attendance records for ${targetDateStr}. (Use --force to overwrite)`)
    return { date: targetDateStr, inserted: 0, existing: employees.length }
  }

  if (options.dryRun) {
    console.log(`  [Dry-Run] Would record ${recordsToInsert.length} attendances for ${targetDateStr} (Hadir: ${hadirCount}, Izin: ${izinCount}, Sakit: ${sakitCount}, Alpha: ${alphaCount})`)
    return { date: targetDateStr, inserted: recordsToInsert.length, dryRun: true }
  }

  // Insert or Upsert
  const conflictClause = options.force
    ? `ON CONFLICT (employee_id, date) DO UPDATE SET
        clock_in = EXCLUDED.clock_in,
        clock_out = EXCLUDED.clock_out,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        updated_at = NOW()`
    : `ON CONFLICT (employee_id, date) DO NOTHING`

  const values = []
  const placeholders = []
  let pCount = 1

  for (const r of recordsToInsert) {
    placeholders.push(`($${pCount}, $${pCount + 1}, $${pCount + 2}, $${pCount + 3}, $${pCount + 4}, $${pCount + 5})`)
    values.push(r.employee_id, r.date, r.clock_in, r.clock_out, r.status, r.notes)
    pCount += 6
  }

  await query(
    `INSERT INTO attendances (employee_id, date, clock_in, clock_out, status, notes)
     VALUES ${placeholders.join(', ')}
     ${conflictClause}`,
    values
  )

  console.log(`  ✅ Processed ${targetDateStr} (${dayNames[dayOfWeek]}): ${recordsToInsert.length} attendances (Hadir: ${hadirCount}, Izin: ${izinCount}, Sakit: ${sakitCount}, Alpha: ${alphaCount})`)

  return {
    date: targetDateStr,
    inserted: recordsToInsert.length,
    hadir: hadirCount,
    izin: izinCount,
    sakit: sakitCount,
    alpha: alphaCount,
  }
}

async function runViaApi(apiUrl, options) {
  const endpoint = `${apiUrl.replace(/\/+$/, '')}/api/automation/daily`
  const secretKey =
    process.env.AUTOMATION_SECRET ||
    process.env.NUXT_AUTOMATION_SECRET ||
    'nexus-hris-automation-secret-2026' ||
    process.env.NUXT_JWT_SECRET

  console.log(`🌐 Calling HRIS Automation API: ${endpoint}`)
  console.log(`  Options: ${JSON.stringify(options)}`)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-automation-key': secretKey,
    },
    body: JSON.stringify(options),
  })

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(`API error [${res.status}]: ${json?.message || res.statusText || 'Unknown error'}`)
  }

  console.log(`\n✅ HRIS Daily Automation API completed successfully!`)
  console.log(`  Message: ${json.message}`)
  if (json.data) {
    console.log(`  Dates Processed (${json.data.datesProcessed?.length || 0}): ${json.data.datesProcessed?.join(', ') || '-'}`)
    console.log(`  Total Attendances Inserted: ${json.data.summary?.totalInserted ?? 0}`)
    console.log(`  Total Dates Skipped: ${json.data.summary?.totalSkipped ?? 0}`)
    if (json.data.transportResults?.length > 0) {
      console.log(`  Transport Synchronized: ${json.data.transportResults.length} month(s)`)
    }
    console.log(`  Execution Time: ${(json.data.durationMs / 1000).toFixed(2)}s\n`)
  }
  return json
}

export async function runDailyAutomation(customOptions = {}) {
  const options = { ...parseArgs(), ...customOptions }

  const apiUrl =
    process.env.API_URL ||
    (options.useApi ? (process.env.NUXT_PUBLIC_API_BASE_URL || 'https://hris.eka-dev.cloud') : null)

  if (apiUrl && !options.directDb) {
    return await runViaApi(apiUrl, options)
  }

  const startTime = Date.now()

  console.log('⚡ Starting Nexus HRIS Daily Automation (Direct DB)...')
  console.log(`  Options: ${JSON.stringify(options)}`)

  // Determine dates to process
  const datesToProcess = []

  if (options.from && options.to) {
    const cur = new Date(options.from)
    const end = new Date(options.to)
    while (cur <= end) {
      datesToProcess.push(formatDate(cur))
      cur.setDate(cur.getDate() + 1)
    }
  } else if (options.date) {
    datesToProcess.push(options.date)
  } else if (options.days > 1) {
    const today = new Date(getTodayWIB())
    for (let i = options.days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      datesToProcess.push(formatDate(d))
    }
  } else {
    // Default: Today in WIB
    datesToProcess.push(getTodayWIB())
  }

  console.log(`  Dates to process (${datesToProcess.length}): ${datesToProcess.join(', ')}`)

  const results = []
  const monthsToSync = new Set()

  for (const dateStr of datesToProcess) {
    const res = await processDate(dateStr, options)
    results.push(res)

    if (!res.skipped && res.inserted > 0) {
      const [year, month] = dateStr.split('-').map(Number)
      monthsToSync.add(`${year}-${month}`)
    }
  }

  // Sync Transport Allowances for affected months
  if (options.syncTransport && monthsToSync.size > 0) {
    console.log(`  🚗 Synchronizing monthly transport allowances for affected months: ${Array.from(monthsToSync).join(', ')}...`)
    for (const ym of monthsToSync) {
      const [year, month] = ym.split('-').map(Number)
      await syncMonthlyTransportAllowances(month, year, options.dryRun)
    }
    console.log(`  ✓ Transport allowances synchronized`)
  }

  // Record activity log
  if (!options.dryRun) {
    const adminUserRes = await query(`SELECT id FROM users WHERE role_id = 1 LIMIT 1`)
    const adminUserId = adminUserRes.rows[0]?.id || 1

    await query(
      `INSERT INTO activity_logs (user_id, action, module, description, metadata, created_at)
       VALUES ($1, 'DAILY_AUTOMATION', 'automation', $2, $3, NOW())`,
      [
        adminUserId,
        `Executed automated daily attendance for ${datesToProcess.length} date(s)`,
        JSON.stringify({
          dates: datesToProcess,
          results,
          duration_ms: Date.now() - startTime,
        }),
      ]
    )
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\n🎉 Daily automation finished in ${durationSec}s!\n`)
  return results
}

// Execute when run directly via CLI
if (process.argv[1]?.endsWith('daily-automation.js')) {
  runDailyAutomation()
    .then(async () => {
      await closePool().catch(() => {})
      process.exit(0)
    })
    .catch(async (err) => {
      console.error('❌ Daily automation failed:', err.message || err)
      await closePool().catch(() => {})
      process.exit(1)
    })
}
