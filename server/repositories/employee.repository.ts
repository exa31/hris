/**
 * Employee Repository
 * Data access layer for employee queries
 */

import type { PoolClient } from 'pg'
import type { Employee } from '~~/server/model/employee.model'

/**
 * Get all employees with pagination and filtering
 */
export const getEmployees = async (
    client: PoolClient,
    options?: {
        limit?: number
        offset?: number
        search?: string
        department?: string
        status?: boolean
        sortColumn?: string
        sortDirection?: 'asc' | 'desc'
        positions?: string[]
        tenureOperator?: string
        tenureValue?: number
    }
): Promise<{ rows: Employee[]; total: number }> => {
    let query = `
        SELECT e.*, r.name as role_name 
        FROM employees e
        LEFT JOIN users u ON e.id = u.employee_id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE e.deleted_at IS NULL
    `
    let countQuery = 'SELECT COUNT(*) as total FROM employees WHERE deleted_at IS NULL'
    const params: any[] = []
    let paramCount = 1

    // Filter by status
    if (options?.status !== undefined) {
        const cond = ` AND status = $${paramCount}`
        query += cond
        countQuery += cond
        params.push(options.status)
        paramCount++
    }

    // Filter by department
    if (options?.department) {
        const cond = ` AND department = $${paramCount}`
        query += cond
        countQuery += cond
        params.push(options.department)
        paramCount++
    }

    // Filter by positions
    if (options?.positions && options.positions.length > 0) {
        const cond = ` AND position = ANY($${paramCount})`
        query += cond
        countQuery += cond
        params.push(options.positions)
        paramCount++
    }

    // Filter by tenure
    if (options?.tenureOperator && options?.tenureValue !== undefined && options?.tenureValue !== null) {
        const operator = options.tenureOperator === '>' || options.tenureOperator === '<' || options.tenureOperator === '=' ? options.tenureOperator : '='
        const cond = ` AND EXTRACT(YEAR FROM age(CURRENT_DATE, join_date::date)) ${operator} $${paramCount}`
        query += cond
        countQuery += cond
        params.push(options.tenureValue)
        paramCount++
    }

    // Search by name, email, or NIP
    if (options?.search) {
        const cond = ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR nip::text ILIKE $${paramCount} OR position ILIKE $${paramCount} OR department ILIKE $${paramCount})`
        query += cond
        countQuery += cond
        params.push(`%${options.search}%`)
        paramCount++
    }

    // Get total count
    const countResult = await client.query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // Order
    const allowedSortColumns = ['nip', 'name', 'position', 'join_date', 'created_at']
    let sortCol = 'join_date'
    if (options?.sortColumn && allowedSortColumns.includes(options.sortColumn)) {
        sortCol = options.sortColumn
    }
    const sortDir = options?.sortDirection === 'asc' ? 'ASC' : 'DESC'
    
    query += ` ORDER BY ${sortCol} ${sortDir}`

    // Add pagination
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

/**
 * Get single employee by ID
 */
export const getEmployeeById = async (client: PoolClient, id: number): Promise<any | null> => {
    const query = `
        SELECT e.*, 
               ea.full_address, ea.district_id, 
               d.name as "districtName", 
               r.name as "regencyName", 
               p.name as "provinceName",
               b.name as "birthCityName"
        FROM employees e
        LEFT JOIN employee_addresses ea ON e.id = ea.employee_id
        LEFT JOIN districts d ON ea.district_id = d.id
        LEFT JOIN regencies r ON d.regency_id = r.id
        LEFT JOIN provinces p ON r.province_id = p.id
        LEFT JOIN regencies b ON e.birth_place_id = b.id
        WHERE e.id = $1 AND e.deleted_at IS NULL
    `
    const result = await client.query(query, [id])
    const employee = result.rows[0]
    
    if (!employee) return null

    // Get educations (separated to avoid Cartesian product duplication)
    const educationsResult = await client.query(`
        SELECT e.id, e.name 
        FROM employee_educations ee
        JOIN educations e ON ee.education_id = e.id
        WHERE ee.employee_id = $1
    `, [id])
    
    employee.educations = educationsResult.rows

    return employee
}

/**
 * Create new employee
 */
export const createEmployee = async (
    client: PoolClient,
    data: any
): Promise<any> => {
    const { district_id, full_address, educations, educationIds, ...employeeData } = data

    const query = `
        INSERT INTO employees 
        (nip, name, email, phone, birth_date, marital_status, gender, children_count, join_date, position, department, status, type, birth_place_id, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
    `

    const result = await client.query(query, [
        employeeData.nip,
        employeeData.name,
        employeeData.email,
        employeeData.phone,
        employeeData.birth_date,
        employeeData.marital_status,
        employeeData.gender,
        employeeData.children_count,
        employeeData.join_date,
        employeeData.position,
        employeeData.department,
        employeeData.status,
        employeeData.type,
        employeeData.birth_place_id,
        employeeData.photo_url,
    ])

    const emp = result.rows[0]

    if (district_id && full_address) {
        await client.query(`
            INSERT INTO employee_addresses (employee_id, district_id, full_address)
            VALUES ($1, $2, $3)
        `, [emp.id, district_id, full_address])
    }

    if (educationIds && Array.isArray(educationIds) && educationIds.length > 0) {
        const values = educationIds.map((id, idx) => `($1, $${idx + 2})`).join(',')
        const eduQuery = `
            INSERT INTO employee_educations (employee_id, education_id)
            VALUES ${values}
        `
        await client.query(eduQuery, [emp.id, ...educationIds])
    }

    return emp
}

/**
 * Update employee
 */
export const updateEmployee = async (
    client: PoolClient,
    id: number,
    data: any
): Promise<any | null> => {
    const { district_id, full_address, educations, educationIds, id: _tempId, ...employeeData } = data

    const updates: string[] = []
    const params: any[] = []
    let paramCount = 1

    Object.entries(employeeData).forEach(([key, value]) => {
        if (value !== undefined) {
            updates.push(`${key} = $${paramCount}`)
            params.push(value)
            paramCount++
        }
    })

    if (updates.length > 0) {
        params.push(id)
        const query = `
            UPDATE employees 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${paramCount}
            RETURNING *
        `
        await client.query(query, params)
    }

    if (district_id !== undefined && full_address !== undefined) {
        const exist = await client.query('SELECT id FROM employee_addresses WHERE employee_id = $1', [id])
        if (exist.rowCount && exist.rowCount > 0) {
            await client.query('UPDATE employee_addresses SET district_id = $1, full_address = $2 WHERE employee_id = $3', [district_id, full_address, id])
        } else {
            await client.query('INSERT INTO employee_addresses (employee_id, district_id, full_address) VALUES ($1, $2, $3)', [id, district_id, full_address])
        }
    }

    if (educationIds !== undefined && Array.isArray(educationIds)) {
        await client.query('DELETE FROM employee_educations WHERE employee_id = $1', [id])
        if (educationIds.length > 0) {
            const values = educationIds.map((eid, idx) => `($1, $${idx + 2})`).join(',')
            const eduQuery = `
                INSERT INTO employee_educations (employee_id, education_id)
                VALUES ${values}
            `
            await client.query(eduQuery, [id, ...educationIds])
        }
    }

    return getEmployeeById(client, id)
}

/**
 * Delete employee
 */
export const deleteEmployee = async (client: PoolClient, id: number): Promise<boolean> => {
    const result = await client.query('UPDATE employees SET deleted_at = NOW(), status = false WHERE id = $1', [id])
    return result.rowCount! > 0
}

/**
 * Bulk update status
 */
export const bulkUpdateStatus = async (
    client: PoolClient,
    ids: number[],
    status: boolean
): Promise<number> => {
    const query = 'UPDATE employees SET status = $1, updated_at = NOW() WHERE id = ANY($2) RETURNING id'
    const result = await client.query(query, [status, ids])
    return result.rowCount!
}

/**
 * Bulk delete employees
 */
export const bulkDeleteEmployees = async (client: PoolClient, ids: number[]): Promise<number> => {
    const query = 'UPDATE employees SET deleted_at = NOW(), status = false WHERE id = ANY($1)'
    const result = await client.query(query, [ids])
    return result.rowCount!
}

/**
 * Get deleted employees
 */
export const getDeletedEmployees = async (
    client: PoolClient,
    options?: { limit?: number; offset?: number; search?: string }
): Promise<{ rows: any[]; total: number }> => {
    let query = `SELECT * FROM employees WHERE deleted_at IS NOT NULL`
    let countQuery = 'SELECT COUNT(*) as total FROM employees WHERE deleted_at IS NOT NULL'
    const params: any[] = []
    let paramCount = 1

    if (options?.search) {
        const cond = ` AND (name ILIKE $${paramCount} OR nip::text ILIKE $${paramCount})`
        query += cond
        countQuery += cond
        params.push(`%${options.search}%`)
        paramCount++
    }

    const { rows: countRows } = await client.query(countQuery, params)
    const total = parseInt(countRows[0].total)

    query += ` ORDER BY deleted_at DESC`

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

    const { rows } = await client.query(query, params)
    return { rows, total }
}

/**
 * Restore deleted employee
 */
export const restoreEmployee = async (client: PoolClient, id: number): Promise<boolean> => {
    const query = 'UPDATE employees SET deleted_at = NULL, status = true WHERE id = $1'
    const result = await client.query(query, [id])
    return result.rowCount! > 0
}

/**
 * Get dashboard status
 */
export const getDashboardStats = async (client: PoolClient) => {
    // Basic counts
    const countsResult = await client.query(`
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE type = 'Kontrak') as kontrak,
            COUNT(*) FILTER (WHERE type = 'Tetap') as tetap,
            COUNT(*) FILTER (WHERE type = 'Magang') as magang,
            COUNT(*) FILTER (WHERE gender = 'Male') as male,
            COUNT(*) FILTER (WHERE gender = 'Female') as female
        FROM employees
        WHERE status = true AND deleted_at IS NULL
    ` )
    
    // Latest 5 employees
    const latestResult = await client.query(`
        SELECT id, name, email, join_date, type, position, department, photo_url
        FROM employees
        WHERE deleted_at IS NULL
        ORDER BY join_date DESC, id DESC
        LIMIT 5
    ` )

    return {
        stats: {
            total: parseInt(countsResult.rows[0]?.total || '0'),
            kontrak: parseInt(countsResult.rows[0]?.kontrak || '0'),
            tetap: parseInt(countsResult.rows[0]?.tetap || '0'),
            magang: parseInt(countsResult.rows[0]?.magang || '0'),
            male: parseInt(countsResult.rows[0]?.male || '0'),
            female: parseInt(countsResult.rows[0]?.female || '0'),
        },
        latestEmployees: latestResult.rows
    }
}

/**
 * Get 5 newest contract employees
 */
export const getNewContractEmployees = async (client: PoolClient) => {
    const result = await client.query(`
        SELECT id, name, email, join_date, type, position, department, photo_url
        FROM employees
        WHERE type = 'Kontrak' AND status = true AND deleted_at IS NULL
        ORDER BY join_date DESC, id DESC
        LIMIT 5
    ` )
    return result.rows
}

/**
 * Check if any of these employees are superadmins
 */
export const checkSuperAdminByIds = async (client: PoolClient, ids: number[]): Promise<any[]> => {
    const query = `
        SELECT e.id, e.name 
        FROM employees e
        JOIN users u ON e.id = u.employee_id 
        JOIN roles r ON u.role_id = r.id 
        WHERE e.id = ANY($1) AND LOWER(r.name) = 'superadmin' AND e.deleted_at IS NULL
    `
    const { rows } = await client.query(query, [ids])
    return rows
}

/**
 * Check employees that still have active user accounts.
 */
export const checkEmployeesWithActiveUsers = async (client: PoolClient, ids: number[]): Promise<any[]> => {
    const query = `
        SELECT e.id, e.name, u.id AS user_id, u.username
        FROM employees e
        JOIN users u ON e.id = u.employee_id
        WHERE e.id = ANY($1)
          AND e.deleted_at IS NULL
          AND u.deleted_at IS NULL
    `
    const { rows } = await client.query(query, [ids])
    return rows
}

/**
 * Soft-delete user accounts linked to the provided employee IDs.
 */
export const softDeleteUsersByEmployeeIds = async (client: PoolClient, ids: number[]): Promise<number[]> => {
    const query = `
        UPDATE users
        SET deleted_at = NOW(), is_active = false, updated_at = NOW()
        WHERE employee_id = ANY($1)
          AND deleted_at IS NULL
        RETURNING id
    `
    const result = await client.query(query, [ids])
    return result.rows.map((row: { id: number }) => row.id)
}
