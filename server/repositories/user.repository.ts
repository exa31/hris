import { PoolClient } from 'pg'
import type { User, SearchUsersInput, CreateUserInput, UpdateUserInput } from '~~/server/model/user.model'

export async function getUsers(client: PoolClient, params: SearchUsersInput) {
    const { limit, offset, search, role_id, is_active, sortColumn, sortDirection } = params

    let query = `
        SELECT u.*, e.name as employee_name, r.name as role_name 
        FROM users u
        INNER JOIN employees e ON u.employee_id = e.id
        INNER JOIN roles r ON u.role_id = r.id
        WHERE 1=1
    `
    const values: any[] = []

    if (search) {
        values.push(`%${search.toLowerCase()}%`)
        query += ` AND (LOWER(u.username) LIKE $${values.length} OR LOWER(e.name) LIKE $${values.length})`
    }

    if (role_id) {
        values.push(role_id)
        query += ` AND u.role_id = $${values.length}`
    }

    if (is_active !== undefined) {
        values.push(is_active)
        query += ` AND u.is_active = $${values.length}`
    }

    // Sort
    const validSortColumns = ['id', 'username', 'created_at', 'employee_name', 'role_name']
    const sort = validSortColumns.includes(sortColumn as string) ? sortColumn : 'created_at'
    const direction = sortDirection === 'asc' ? 'ASC' : 'DESC'
    
    // Total count before limit/offset
    const totalQuery = `SELECT COUNT(*) as total FROM (${query}) as count_query`
    const { rows: countRows } = await client.query(totalQuery, values)
    const total = parseInt(countRows[0].total)

    // Final query
    query += ` ORDER BY ${sort} ${direction} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
    values.push(limit, offset)

    const { rows } = await client.query(query, values)
    return { rows, total }
}

export async function getUserById(client: PoolClient, id: number) {
    const query = `
        SELECT u.*, e.name as employee_name, r.name as role_name 
        FROM users u
        INNER JOIN employees e ON u.employee_id = e.id
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
    `
    const { rows } = await client.query(query, [id])
    return rows[0] as User || null
}

export async function getUserByUsername(client: PoolClient, username: string) {
    const query = `SELECT * FROM users WHERE LOWER(username) = LOWER($1)`
    const { rows } = await client.query(query, [username])
    return rows[0] as User || null
}

export async function createUser(client: PoolClient, data: CreateUserInput & { password_hash: string }) {
    const query = `
        INSERT INTO users (employee_id, username, password_hash, role_id, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `
    const { rows } = await client.query(query, [
        data.employee_id,
        data.username,
        data.password_hash,
        data.role_id,
        data.is_active
    ])
    return rows[0] as User
}

export async function updateUser(client: PoolClient, id: number, data: Partial<UpdateUserInput> & { password_hash?: string }) {
    const fields = []
    const values = []
    let idx = 1

    if (data.username !== undefined) {
        fields.push(`username = $${idx++}`)
        values.push(data.username)
    }
    if (data.password_hash !== undefined) {
        fields.push(`password_hash = $${idx++}`)
        values.push(data.password_hash)
    }
    if (data.role_id !== undefined) {
        fields.push(`role_id = $${idx++}`)
        values.push(data.role_id)
    }
    if (data.is_active !== undefined) {
        fields.push(`is_active = $${idx++}`)
        values.push(data.is_active)
    }

    if (fields.length === 0) return getUserById(client, id)

    fields.push(`updated_at = current_timestamp`)

    const query = `
        UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = $${idx} 
        RETURNING *
    `
    values.push(id)

    const { rows } = await client.query(query, values)
    return rows[0] as User
}

export async function deleteUser(client: PoolClient, id: number) {
    const query = `DELETE FROM users WHERE id = $1`
    await client.query(query, [id])
}

export async function getRoles(client: PoolClient) {
    const { rows } = await client.query(`SELECT id, name FROM roles ORDER BY name ASC`)
    return rows
}

export async function isEmployeeAlreadyUser(client: PoolClient, employeeId: number, excludeUserId?: number) {
    let query = `SELECT id FROM users WHERE employee_id = $1`
    const values = [employeeId]
    
    if (excludeUserId) {
        query += ` AND id != $2`
        values.push(excludeUserId)
    }
    
    const { rows } = await client.query(query, values)
    return rows.length > 0
}
export async function searchEmployeesWithoutAccount(client: PoolClient, search: string) {
    const query = `
        SELECT e.id, e.name, e.nip, e.position, e.department
        FROM employees e
        LEFT JOIN users u ON e.id = u.employee_id
        WHERE u.id IS NULL
        AND (LOWER(e.name) LIKE $1 OR CAST(e.nip AS TEXT) LIKE $1)
        LIMIT 10
    `
    const { rows } = await client.query(query, [`%${search.toLowerCase()}%`])
    return rows
}
