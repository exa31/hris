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
    const rolesQuery = `SELECT id, name FROM roles ORDER BY name ASC`
    const { rows: roles } = await client.query(rolesQuery)

    // Parallel fetch permissions for each role
    const rolesWithPermissions = await Promise.all(roles.map(async (role: any) => {
        const permsQuery = `
            SELECT p.* 
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
        `
        const { rows: perms } = await client.query(permsQuery, [role.id])
        return { ...role, permissions: perms }
    }))

    return rolesWithPermissions
}

export async function getPermissions(client: PoolClient) {
    const { rows } = await client.query(`SELECT * FROM permissions ORDER BY module ASC, name ASC`)
    return rows
}

export async function getPermissionsByRoleId(client: PoolClient, roleId: number) {
    const { rows } = await client.query(
        `SELECT p.module, p.action, p.name
         FROM permissions p
         INNER JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role_id = $1
         ORDER BY p.module ASC, p.action ASC`,
        [roleId]
    )
    return rows as { module: string; action: string; name: string }[]
}

export async function updateRolePermissions(client: PoolClient, roleId: number, name: string, permissionIds: number[]) {
    // 1. Update role name if provided
    await client.query(`UPDATE roles SET name = $1 WHERE id = $2`, [name, roleId])

    // 2. Delete existing permissions
    await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId])

    // 3. Insert new permissions
    if (permissionIds.length > 0) {
        const values = permissionIds.map((pid, idx) => `($1, $${idx + 2})`).join(', ')
        const query = `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`
        await client.query(query, [roleId, ...permissionIds])
    }

    return getRoles(client).then(roles => roles.find(r => r.id === roleId))
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
