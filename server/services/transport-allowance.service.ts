import type { PoolClient } from 'pg'
import * as repo from '~~/server/repositories/transport-allowance.repository'
import type { AllowanceRecord } from '~~/server/repositories/transport-allowance.repository'
import { HttpError } from '~~/server/errors/HttpError'

// ========================
// BUSINESS RULE CONSTANTS
// ========================
const MIN_WORKING_DAYS = 19      // Hari kerja minimum agar eligible
const MIN_DISTANCE_KM = 5        // Jarak ≤ 5 km → tunjangan = 0
const MAX_DISTANCE_KM = 25       // Jarak > 25 km → cap di 25

// ========================
// TRANSPORT ALLOWANCE (DATA)
// ========================

export const getTransportAllowances = async (client: PoolClient, options?: any) => {
    return repo.getTransportAllowances(client, options)
}

export const getTransportAllowanceById = async (client: PoolClient, id: number) => {
    const allowance = await repo.getTransportAllowanceById(client, id)
    if (!allowance) {
        throw new HttpError(404, 'NOT_FOUND', 'Data tunjangan transport tidak ditemukan')
    }
    return allowance
}

export const createTransportAllowance = async (client: PoolClient, data: any) => {
    if (!data.employee_id || !data.month || !data.year) {
        throw new HttpError(400, 'INVALID_REQUEST', 'employee_id, month, dan year wajib diisi')
    }
    return repo.createTransportAllowance(client, data)
}

export const deleteTransportAllowance = async (client: PoolClient, id: number) => {
    const deleted = await repo.deleteTransportAllowance(client, id)
    if (!deleted) {
        throw new HttpError(404, 'NOT_FOUND', 'Data tunjangan transport tidak ditemukan')
    }
    return { success: true }
}

// ========================
// CORE: CALCULATION ENGINE
// ========================

/**
 * Apply business-rule rounding: < 0.5 → floor, >= 0.5 → ceil
 */
function businessRound(value: number): number {
    const decimal = value - Math.floor(value)
    return decimal >= 0.5 ? Math.ceil(value) : Math.floor(value)
}

/**
 * Calculate transport allowance for a single employee record
 *
 * Rules:
 * 1. Employee type must be "Tetap" → else amount = 0
 * 2. working_days must be >= 19 → else amount = 0
 * 3. distance_km <= 5 → amount = 0
 * 4. distance_km > 25 → cap to 25
 * 5. Round distance_km using business rounding
 * 6. amount = base_fare × calculated_km × working_days
 */
function calculateAllowance(params: {
    employeeType: string
    baseFare: number
    distanceKm: number
    workingDays: number
}): { calculated_km: number; amount: number; reason?: string } {
    const { employeeType, baseFare, distanceKm, workingDays } = params

    // Rule 1: Only "Tetap" employees are eligible
    if (employeeType !== 'Tetap') {
        return { calculated_km: 0, amount: 0, reason: 'Tipe pegawai bukan Tetap' }
    }

    // Rule 2: Minimum 19 working days
    if (workingDays < MIN_WORKING_DAYS) {
        return { calculated_km: 0, amount: 0, reason: `Hari kerja < ${MIN_WORKING_DAYS}` }
    }

    // Rule 3: Distance <= 5 km → no allowance
    if (distanceKm <= MIN_DISTANCE_KM) {
        return { calculated_km: 0, amount: 0, reason: `Jarak ≤ ${MIN_DISTANCE_KM} km` }
    }

    // Rule 4: Cap max distance to 25 km
    let effectiveKm = distanceKm
    if (effectiveKm > MAX_DISTANCE_KM) {
        effectiveKm = MAX_DISTANCE_KM
    }

    // Rule 5: Business rounding
    const calculatedKm = businessRound(effectiveKm)

    // Rule 6: Calculate amount
    const amount = baseFare * calculatedKm * workingDays

    return { calculated_km: calculatedKm, amount }
}

// ========================
// GENERATE FEATURE
// ========================

/**
 * Generate transport allowances for all employees in a given period.
 *
 * Flow:
 * 1. Get active transport setting (base_fare)
 * 2. Get all active employees
 * 3. For each employee:
 *    - Generate random working_days (18-25) and distance_km (1-30)
 *    - Apply eligibility & calculation rules
 * 4. Bulk insert results
 * 5. Prevent duplicates (or force regenerate)
 */
export const generateAllowances = async (
    client: PoolClient,
    month: number,
    year: number,
    force: boolean = false
) => {
    // Check duplicate
    const exists = await repo.existsForPeriod(client, month, year)
    if (exists && !force) {
        throw new HttpError(
            409,
            'ALREADY_GENERATED',
            `Data tunjangan untuk periode ${month}/${year} sudah pernah di-generate. Gunakan fitur Regenerate jika ingin membuat ulang.`
        )
    }

    // Force regenerate → delete old data
    if (exists && force) {
        await repo.deleteByPeriod(client, month, year)
    }

    // Get transport setting
    const settings = await repo.getTransportSettings(client)
    if (!settings || !settings.is_active) {
        throw new HttpError(
            400,
            'SETTING_INACTIVE',
            'Pengaturan tunjangan transport tidak aktif atau belum diatur. Silakan aktifkan terlebih dahulu.'
        )
    }

    const baseFare = settings.base_fare
    if (!baseFare || baseFare <= 0) {
        throw new HttpError(
            400,
            'INVALID_RATE',
            'Base fare belum diatur atau bernilai 0. Silakan atur di halaman Pengaturan Tunjangan.'
        )
    }

    // Get ALL active employees with their working days for this period
    const employees = await repo.getAllEmployeesWithWorkingDays(client, month, year)
    if (employees.length === 0) {
        throw new HttpError(400, 'NO_EMPLOYEES', 'Tidak ada pegawai aktif yang ditemukan')
    }

    // Generate records with simulation data
    let eligibleCount = 0
    let skippedCount = 0

    const records: AllowanceRecord[] = employees.map(emp => {
        // Use real working_days and distance_km from database
        const workingDays = emp.working_days
        const distanceKm = emp.distance_km

        const result = calculateAllowance({
            employeeType: emp.type,
            baseFare,
            distanceKm,
            workingDays,
        })

        if (result.amount > 0) {
            eligibleCount++
        } else {
            skippedCount++
        }

        return {
            employee_id: emp.id,
            month,
            year,
            base_fare: baseFare,
            distance_km: distanceKm,
            calculated_km: result.calculated_km,
            working_days: workingDays,
            amount: result.amount,
            total_allowance: result.amount, // backward compat with old column
        }
    })

    // Bulk insert
    const inserted = await repo.bulkInsertAllowances(client, records)

    return {
        period: `${month}/${year}`,
        base_fare: baseFare,
        total_employees: employees.length,
        total_inserted: inserted,
        eligible_count: eligibleCount,
        skipped_count: skippedCount,
    }
}

// ========================
// TRANSPORT SETTINGS (CONFIG)
// ========================

export const getTransportSettings = async (client: PoolClient) => {
    const settings = await repo.getTransportSettings(client)
    if (!settings) {
        return {
            id: null,
            base_fare: 2000,
            is_active: true,
        }
    }
    return settings
}

export const updateTransportSettings = async (
    client: PoolClient,
    data: { base_fare: number; is_active: boolean }
) => {
    return repo.upsertTransportSettings(client, data)
}
