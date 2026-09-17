import { query } from '~~/server/db/postgres'
import type { PoolClient } from 'pg'

export interface DailyAutomationOptions {
  date?: string | null
  days?: number
  from?: string | null
  to?: string | null
  includeWeekends?: boolean
  force?: boolean
  syncTransport?: boolean
  dryRun?: boolean
}

export interface AttendanceRecordResult {
  date: string
  skipped?: boolean
  reason?: string
  inserted?: number
  existing?: number
  hadir?: number
  izin?: number
  sakit?: number
  alpha?: number
  dryRun?: boolean
}

export interface TransportSyncResult {
  month: number
  year: number
  totalEmployees: number
  eligibleCount: number
  dryRun?: boolean
}

export interface DailyAutomationReport {
  datesProcessed: string[]
  attendanceResults: AttendanceRecordResult[]
  transportResults: TransportSyncResult[]
  durationMs: number
  summary: {
    totalDates: number
    totalInserted: number
    totalSkipped: number
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getTodayWIB(): string {
  const now = new Date()
  const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  return formatDate(wibTime)
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function businessRound(value: number): number {
  const decimal = value - Math.floor(value)
  return decimal >= 0.5 ? Math.ceil(value) : Math.floor(value)
}

/**
 * Synchronize monthly transport allowance calculations based on official company rules:
 * 1. Status 'Tetap' only
 * 2. Minimum 19 working days (Hadir)
 * 3. Distance > 5km, capped at 25km
 * 4. Business rounding: decimal >= 0.5 rounded up, < 0.5 down
 * 5. Amount = base_fare * calculated_km * working_days
 */
export async function syncMonthlyTransportAllowances(
  month: number,
  year: number,
  dryRun = false
): Promise<TransportSyncResult> {
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

  const records: any[] = []
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

  if (dryRun || records.length === 0) {
    return {
      month,
      year,
      totalEmployees: records.length,
      eligibleCount,
      dryRun,
    }
  }

  const values: any[] = []
  const placeholders: string[] = []
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

  return {
    month,
    year,
    totalEmployees: records.length,
    eligibleCount,
    dryRun: false,
  }
}

/**
 * Process automated attendance for a specific date
 */
async function processDate(
  targetDateStr: string,
  options: DailyAutomationOptions
): Promise<AttendanceRecordResult> {
  const targetDate = new Date(targetDateStr)
  const dayOfWeek = targetDate.getDay() // 0: Sun, 6: Sat

  if ((dayOfWeek === 0 || dayOfWeek === 6) && !options.includeWeekends) {
    return { date: targetDateStr, skipped: true, reason: 'weekend' }
  }

  // 1. Fetch active employees
  const employeesRes = await query(
    `SELECT id, name, type, join_date
     FROM employees
     WHERE status = true AND deleted_at IS NULL AND join_date <= $1
     ORDER BY id ASC`,
    [targetDateStr]
  )
  const employees = employeesRes.rows

  if (employees.length === 0) {
    return { date: targetDateStr, skipped: true, reason: 'no_employees' }
  }

  // 2. Fetch approved leaves for this date
  const leavesRes = await query(
    `SELECT lr.employee_id, lt.name as leave_type_name
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.status = 'Approved'
       AND lr.start_date <= $1
       AND lr.end_date >= $1`,
    [targetDateStr]
  )

  const leaveMap = new Map<number, string>()
  for (const row of leavesRes.rows) {
    leaveMap.set(row.employee_id, row.leave_type_name)
  }

  // 3. Check existing attendances for this date
  const existingAttRes = await query(
    `SELECT employee_id FROM attendances WHERE date = $1`,
    [targetDateStr]
  )
  const existingEmployeeIds = new Set(existingAttRes.rows.map((r: any) => r.employee_id))

  const recordsToInsert: any[] = []
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
    return {
      date: targetDateStr,
      inserted: 0,
      existing: employees.length,
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
    }
  }

  if (options.dryRun) {
    return {
      date: targetDateStr,
      inserted: recordsToInsert.length,
      dryRun: true,
      hadir: hadirCount,
      izin: izinCount,
      sakit: sakitCount,
      alpha: alphaCount,
    }
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

  const values: any[] = []
  const placeholders: string[] = []
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

  return {
    date: targetDateStr,
    inserted: recordsToInsert.length,
    hadir: hadirCount,
    izin: izinCount,
    sakit: sakitCount,
    alpha: alphaCount,
  }
}

/**
 * Main routine: Executes daily attendance automation & monthly transport sync
 */
export async function runDailyAutomationRoutine(
  options: DailyAutomationOptions = {}
): Promise<DailyAutomationReport> {
  const startTime = Date.now()
  const datesToProcess: string[] = []

  if (options.from && options.to) {
    const start = new Date(options.from)
    const end = new Date(options.to)
    const cur = new Date(start)
    while (cur <= end) {
      datesToProcess.push(formatDate(cur))
      cur.setDate(cur.getDate() + 1)
    }
  } else if (options.date) {
    datesToProcess.push(options.date)
  } else {
    const days = Math.max(1, options.days || 1)
    const today = new Date(getTodayWIB())
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      datesToProcess.push(formatDate(d))
    }
  }

  const attendanceResults: AttendanceRecordResult[] = []
  const monthsToSync = new Set<string>()

  let totalInserted = 0
  let totalSkipped = 0

  for (const dateStr of datesToProcess) {
    const res = await processDate(dateStr, options)
    attendanceResults.push(res)

    if (res.skipped) {
      totalSkipped++
    } else {
      totalInserted += res.inserted || 0
      const [year, month] = dateStr.split('-').map(Number)
      monthsToSync.add(`${year}-${month}`)
    }
  }

  // Sync Transport Allowances for affected months
  const transportResults: TransportSyncResult[] = []
  const syncTransport = options.syncTransport !== false

  if (syncTransport && monthsToSync.size > 0) {
    for (const ym of monthsToSync) {
      const [year, month] = ym.split('-').map(Number)
      const tRes = await syncMonthlyTransportAllowances(month, year, options.dryRun)
      transportResults.push(tRes)
    }
  }

  // Record audit activity log
  if (!options.dryRun) {
    try {
      const adminUserRes = await query(`SELECT id FROM users WHERE role_id = 1 LIMIT 1`)
      const adminUserId = adminUserRes.rows[0]?.id || 1

      await query(
        `INSERT INTO activity_logs (user_id, action, module, description, metadata, created_at)
         VALUES ($1, 'DAILY_AUTOMATION', 'automation', $2, $3, NOW())`,
        [
          adminUserId,
          `Automated daily attendance & transport sync executed for ${datesToProcess.length} date(s)`,
          JSON.stringify({
            dates: datesToProcess,
            results: attendanceResults,
            transport: transportResults,
            duration_ms: Date.now() - startTime,
          }),
        ]
      )
    } catch (err: any) {
      // Activity logging failure should not abort the whole routine
      console.warn('[automation] Failed to write activity log:', err?.message)
    }
  }

  return {
    datesProcessed: datesToProcess,
    attendanceResults,
    transportResults,
    durationMs: Date.now() - startTime,
    summary: {
      totalDates: datesToProcess.length,
      totalInserted,
      totalSkipped,
    },
  }
}
