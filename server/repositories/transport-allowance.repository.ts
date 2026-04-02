import type { PoolClient } from 'pg'
import type { TransportAllowance, CreateTransportAllowanceInput, UpdateTransportAllowanceInput } from '~~/server/model/transport-allowance.model'

export const getTransportAllowances = async (
    client: PoolClient,
    options?: {
        month?: number
        year?: number
        status?: string
        search?: string
        limit?: number
        offset?: number
    }
): Promise<{ rows: any[]; total: number }> => {
    let query = `
        SELECT ta.*, e.name as "employeeName", e.nip, e.department as departemen
        FROM transport_allowances ta
        JOIN employees e ON ta.employee_id = e.id
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

    // Count query
    const countResult = await client.query(`SELECT COUNT(*) FROM (${query}) as total`, params)
    const total = parseInt(countResult.rows[0].count)

    // Order and Pagination
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
        SELECT ta.*, e.name as "employeeName", e.nip, e.department as departemen
        FROM transport_allowances ta
        JOIN employees e ON ta.employee_id = e.id
        WHERE ta.id = $1
    `
    const result = await client.query(query, [id])
    return result.rows[0] || null
}

export const createTransportAllowance = async (
    client: PoolClient,
    data: CreateTransportAllowanceInput
): Promise<TransportAllowance> => {
    const query = `
        INSERT INTO transport_allowances 
        (employee_id, month, year, distance_km, working_days, total_allowance)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `
    const result = await client.query(query, [
        data.employee_id,
        data.month,
        data.year,
        data.distance_km,
        data.working_days,
        data.total_allowance
    ])
    return result.rows[0]
}

export const updateTransportAllowance = async (
    client: PoolClient,
    id: number,
    data: Partial<TransportAllowance>
): Promise<TransportAllowance | null> => {
    const updates: string[] = []
    const params: any[] = [id]
    let paramCount = 2

    const fields = ['employee_id', 'month', 'year', 'distance_km', 'working_days', 'total_allowance']
    fields.forEach(field => {
        if ((data as any)[field] !== undefined) {
            updates.push(`${field} = $${paramCount}`)
            params.push((data as any)[field])
            paramCount++
        }
    })

    if (updates.length === 0) return getTransportAllowanceById(client, id)

    const query = `
        UPDATE transport_allowances 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `
    const result = await client.query(query, params)
    return result.rows[0] || null
}

export const deleteTransportAllowance = async (client: PoolClient, id: number): Promise<boolean> => {
    const result = await client.query('DELETE FROM transport_allowances WHERE id = $1', [id])
    return result.rowCount! > 0
}

export const getTransportSettings = async (client: PoolClient): Promise<any> => {
    const result = await client.query('SELECT * FROM transport_settings ORDER BY updated_at DESC LIMIT 1')
    if (!result.rows[0]) return null

    const row = result.rows[0]
    return {
        id: row.id,
        baseFare: parseFloat(row.base_fare_per_km || 0),
        tariffPerKm: parseFloat(row.tariff_per_km || 0),
        minDistance: parseFloat(row.min_distance || 5),
        maxDistance: parseFloat(row.max_distance || 25),
        minWorkingDays: row.min_working_days || 19,
        updatedBy: row.updated_by || 'System',
        lastUpdated: row.updated_at,
    }
}

export const updateTransportSettings = async (
    client: PoolClient,
    settings: {
        baseFare: number
        tariffPerKm: number
        minDistance: number
        maxDistance: number
        minWorkingDays: number
        updatedBy?: string
    }
): Promise<any> => {
    // Check if settings exist
    const exist = await client.query('SELECT id FROM transport_settings LIMIT 1')

    const query = `
        UPDATE transport_settings
        SET base_fare_per_km = $1,
            tariff_per_km = $2,
            min_distance = $3,
            max_distance = $4,
            min_working_days = $5,
            updated_by = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
    `

    if (exist.rowCount! > 0) {
        const result = await client.query(query, [
            settings.baseFare,
            settings.tariffPerKm,
            settings.minDistance,
            settings.maxDistance,
            settings.minWorkingDays,
            settings.updatedBy || 'System',
            exist.rows[0].id,
        ])

        const row = result.rows[0]
        return {
            id: row.id,
            baseFare: parseFloat(row.base_fare_per_km),
            tariffPerKm: parseFloat(row.tariff_per_km || 0),
            minDistance: parseFloat(row.min_distance || 5),
            maxDistance: parseFloat(row.max_distance || 25),
            minWorkingDays: row.min_working_days || 19,
            updatedBy: row.updated_by || 'System',
            lastUpdated: row.updated_at,
        }
    } else {
        // Insert new record
        const result = await client.query(
            `INSERT INTO transport_settings 
             (base_fare_per_km, tariff_per_km, min_distance, max_distance, min_working_days, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                settings.baseFare,
                settings.tariffPerKm,
                settings.minDistance,
                settings.maxDistance,
                settings.minWorkingDays,
                settings.updatedBy || 'System',
            ]
        )

        const row = result.rows[0]
        return {
            id: row.id,
            baseFare: parseFloat(row.base_fare_per_km),
            tariffPerKm: parseFloat(row.tariff_per_km || 0),
            minDistance: parseFloat(row.min_distance || 5),
            maxDistance: parseFloat(row.max_distance || 25),
            minWorkingDays: row.min_working_days || 19,
            updatedBy: row.updated_by || 'System',
            lastUpdated: row.updated_at,
        }
    }
}
