import type { PoolClient } from 'pg'

// ========================
// TRANSPORT ALLOWANCE (DATA - READ ONLY)
// ========================

export const getTransportAllowances = async (
    client: PoolClient,
    options?: {
        month?: number
        year?: number
        search?: string
        limit?: number
        offset?: number
    }
): Promise<{ rows: any[]; total: number }> => {
    let query = `
        SELECT ta.id, ta.employee_id, ta.month, ta.year,
               ta.base_fare, ta.distance_km, ta.calculated_km,
               ta.working_days, ta.amount, ta.generated_at,
               e.name as "employeeName", e.nip, d.name as departemen, e.type as employee_type
        FROM transport_allowances ta
        JOIN employees e ON ta.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 1

    if (options?.month) {
        query += ` AND ta.month = $${paramCount}`
        params.push(options.month)
        paramCount++
    }

    if (options?.year) {
        query += ` AND ta.year = $${paramCount}`
        params.push(options.year)
        paramCount++
    }

    if (options?.search) {
        query += ` AND (e.name ILIKE $${paramCount} OR e.nip::text ILIKE $${paramCount})`
        params.push(`%${options.search}%`)
        paramCount++
    }

    const countResult = await client.query(`SELECT COUNT(*) FROM (${query}) as total`, params)
    const total = parseInt(countResult.rows[0].count)

    query += ` ORDER BY ta.year DESC, ta.month DESC, e.name ASC`

    if (options?.limit) {
        query += ` LIMIT $${paramCount}`
        params.push(options.limit)
        paramCount++
    }
    if (options?.offset) {
        query += ` OFFSET $${paramCount}`
        params.push(options.offset)
        paramCount++
    }

    const result = await client.query(query, params)
    return { rows: result.rows, total }
}

export const getTransportAllowanceById = async (client: PoolClient, id: number): Promise<any | null> => {
    const query = `
        SELECT ta.id, ta.employee_id, ta.month, ta.year,
               ta.base_fare, ta.distance_km, ta.calculated_km,
               ta.working_days, ta.amount, ta.generated_at,
               e.name as "employeeName", e.nip, d.name as departemen, e.type as employee_type
        FROM transport_allowances ta
        JOIN employees e ON ta.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ta.id = $1
    `
    const result = await client.query(query, [id])
    return result.rows[0] || null
}

/**
 * Check if data already exists for a given period
 */
export const existsForPeriod = async (
    client: PoolClient,
    month: number,
    year: number
): Promise<boolean> => {
    const result = await client.query(
        'SELECT 1 FROM transport_allowances WHERE month = $1 AND year = $2 LIMIT 1',
        [month, year]
    )
    return result.rowCount! > 0
}

/**
 * Bulk insert transport allowances (for generate feature)
 */
export interface AllowanceRecord {
    employee_id: number
    month: number
    year: number
    base_fare: number
    distance_km: number
    calculated_km: number
    working_days: number
    amount: number
    total_allowance: number
}

export const bulkInsertAllowances = async (
    client: PoolClient,
    records: AllowanceRecord[]
): Promise<number> => {
    if (records.length === 0) return 0

    const values: any[] = []
    const placeholders: string[] = []
    let paramCount = 1

    for (const r of records) {
        placeholders.push(
            `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7}, $${paramCount + 8}, NOW())`
        )
        values.push(
            r.employee_id, r.month, r.year,
            r.base_fare, r.distance_km, r.calculated_km,
            r.working_days, r.amount, r.total_allowance
        )
        paramCount += 9
    }

    const query = `
        INSERT INTO transport_allowances
            (employee_id, month, year, base_fare, distance_km, calculated_km, working_days, amount, total_allowance, generated_at)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (employee_id, month, year) DO NOTHING
    `
    const result = await client.query(query, values)
    return result.rowCount || 0
}

/**
 * Delete all allowances for a given period (for regenerate feature)
 */
export const deleteByPeriod = async (
    client: PoolClient,
    month: number,
    year: number
): Promise<number> => {
    const result = await client.query(
        'DELETE FROM transport_allowances WHERE month = $1 AND year = $2',
        [month, year]
    )
    return result.rowCount || 0
}

// ========================
// TRANSPORT SETTINGS (CONFIG)
// ========================

export const getTransportSettings = async (client: PoolClient): Promise<any> => {
    const result = await client.query('SELECT * FROM transport_settings ORDER BY id ASC LIMIT 1')
    if (!result.rows[0]) return null

    const row = result.rows[0]
    return {
        id: row.id,
        base_fare: parseFloat(row.base_fare_per_km || row.rate_per_day || 2000),
        is_active: row.is_active ?? true,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }
}

export const upsertTransportSettings = async (
    client: PoolClient,
    data: { base_fare: number; is_active: boolean }
): Promise<any> => {
    const exist = await client.query('SELECT id FROM transport_settings LIMIT 1')

    if (exist.rowCount! > 0) {
        const result = await client.query(
            `UPDATE transport_settings
             SET base_fare_per_km = $1, rate_per_day = $1, is_active = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [data.base_fare, data.is_active, exist.rows[0].id]
        )
        const row = result.rows[0]
        return {
            id: row.id,
            base_fare: parseFloat(row.base_fare_per_km),
            is_active: row.is_active,
            updated_at: row.updated_at,
        }
    } else {
        const result = await client.query(
            `INSERT INTO transport_settings (base_fare_per_km, rate_per_day, is_active)
             VALUES ($1, $1, $2)
             RETURNING *`,
            [data.base_fare, data.is_active]
        )
        const row = result.rows[0]
        return {
            id: row.id,
            base_fare: parseFloat(row.base_fare_per_km),
            is_active: row.is_active,
            updated_at: row.updated_at,
        }
    }
}

/**
 * Get all employees (active) for generating allowances — includes type for eligibility check
 */
export const getAllEmployeesWithWorkingDays = async (client: PoolClient, month: number, year: number): Promise<{ id: number; name: string; type: string; distance_km: number; working_days: number }[]> => {
    const result = await client.query(
        `SELECT e.id, e.name, e.type, COALESCE(e.distance_km, 10) as distance_km,
               COUNT(a.id) as working_days
        FROM employees e
        LEFT JOIN attendances a ON a.employee_id = e.id 
                               AND EXTRACT(MONTH FROM a.date) = $1 
                               AND EXTRACT(YEAR FROM a.date) = $2
                               AND a.status = 'Hadir'
        WHERE e.status = true AND e.deleted_at IS NULL
        GROUP BY e.id
        ORDER BY e.name ASC`,
        [month, year]
    )
    return result.rows.map(r => ({
        ...r,
        distance_km: parseFloat(r.distance_km),
        working_days: parseInt(r.working_days) || 0
    }));
}
