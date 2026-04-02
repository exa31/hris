import type { PoolClient } from "pg";
import type { UserModel } from "~~/server/model/user.model";

export const getUserByEmail = async (client: PoolClient, email: string): Promise<UserModel | null> => {
    const query = `
        SELECT id, email, name
        FROM users
        WHERE email = $1 LIMIT 1
    `;
    const values = [email];

    const res = await client.query<UserModel>(query, values);
    if (res.rows.length === 0) {
        return null;
    }
    return res.rows[0] || null;
}

/**
 * Get user by username with employee details and role information
 */
export const getUserByUsername = async (client: PoolClient, username: string) => {
    const query = `
        SELECT 
            u.id,
            u.username,
            u.password_hash,
            u.role_id,
            u.is_active,
            u.employee_id,
            e.name as employee_name,
            r.name as role_name
        FROM users u
        JOIN employees e ON u.employee_id = e.id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.username = $1 OR e.email = $1 OR e.phone = $1 LIMIT 1
    `;
    const values = [username];

    const res = await client.query(query, values);
    if (res.rows.length === 0) {
        return null;
    }
    return res.rows[0] || null;
}

/**
 * Get user by ID with employee and role details
 */
export const getUserById = async (client: PoolClient, userId: number) => {
    const query = `
        SELECT 
            u.id,
            u.username,
            u.role_id,
            u.is_active,
            u.employee_id,
            e.name as employee_name,
            e.email,
            e.phone,
            r.name as role_name
        FROM users u
        JOIN employees e ON u.employee_id = e.id
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1 LIMIT 1
    `;
    const values = [userId];

    const res = await client.query(query, values);
    if (res.rows.length === 0) {
        return null;
    }
    return res.rows[0] || null;
}

/**
 * Create new user
 */
export const createUser = async (client: PoolClient, userData: {
    employee_id: number
    username: string
    password_hash: string
    role_id: number
    is_active?: boolean
}) => {
    const query = `
        INSERT INTO users (employee_id, username, password_hash, role_id, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, employee_id, role_id, is_active, created_at
    `;
    const values = [
        userData.employee_id,
        userData.username,
        userData.password_hash,
        userData.role_id,
        userData.is_active ?? true
    ];

    const res = await client.query(query, values);
    return res.rows[0] || null;
}

/**
 * Update user
 */
export const updateUser = async (client: PoolClient, userId: number, userData: {
    username?: string
    password_hash?: string
    role_id?: number
    is_active?: boolean
}) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (userData.username !== undefined) {
        fields.push(`username = $${paramIndex}`);
        values.push(userData.username);
        paramIndex++;
    }
    if (userData.password_hash !== undefined) {
        fields.push(`password_hash = $${paramIndex}`);
        values.push(userData.password_hash);
        paramIndex++;
    }
    if (userData.role_id !== undefined) {
        fields.push(`role_id = $${paramIndex}`);
        values.push(userData.role_id);
        paramIndex++;
    }
    if (userData.is_active !== undefined) {
        fields.push(`is_active = $${paramIndex}`);
        values.push(userData.is_active);
        paramIndex++;
    }

    if (fields.length === 0) {
        return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, username, employee_id, role_id, is_active, updated_at
    `;

    const res = await client.query(query, values);
    return res.rows[0] || null;
}
