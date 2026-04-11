import { PoolClient } from 'pg'

export interface CreateActivityLog {
    user_id: number
    action: string
    module: string
    description: string
    metadata?: any
}

export interface ActivityLogOptions {
    limit: number
    offset: number
}

/**
 * Save a new activity log entry
 */
export async function saveLog(client: PoolClient, log: CreateActivityLog) {
    const query = `
        INSERT INTO activity_logs (user_id, action, module, description, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `
    const { rows } = await client.query(query, [
        log.user_id,
        log.action,
        log.module,
        log.description,
        log.metadata ? JSON.stringify(log.metadata) : null
    ])
    return rows[0]
}

/**
 * Get activity logs with pagination
 */
export async function getLogs(client: PoolClient, options: ActivityLogOptions) {
    // We join with users and employees to get names
    const query = `
        SELECT 
            al.*, 
            u.username,
            e.name as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN employees e ON u.employee_id = e.id
        ORDER BY al.created_at DESC
        LIMIT $1 OFFSET $2
    `
    const countQuery = `SELECT COUNT(*) as total FROM activity_logs`

    const [logsRes, countRes] = await Promise.all([
        client.query(query, [options.limit, options.offset]),
        client.query(countQuery)
    ])
    console.log('Fetched logs:', logsRes.rows)
    return {
        rows: logsRes.rows,
        total: parseInt(countRes.rows[0].total)
    }
}
