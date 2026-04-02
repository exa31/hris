import { PoolClient } from 'pg'
import * as activityLogRepository from '~~/server/repositories/activity-log.repository'

export interface CreateActivityLog {
    user_id: number
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS' | string
    module: string
    description: string
    metadata?: any
}

export interface ActivityLogOptions {
    limit?: number
    offset?: number
}

/**
 * Log a user activity
 */
export async function logActivity(client: PoolClient, log: CreateActivityLog) {
    try {
        return activityLogRepository.saveLog(client, log)
    } catch (e) {
        console.error('Failed to log activity:', e)
        // We don't throw here to not block the main transaction if logging fails
        return null
    }
}

/**
 * Get activity logs
 */
export async function getActivityLogs(client: PoolClient, options: ActivityLogOptions = {}) {
    const opts = {
        limit: options.limit ?? 50,
        offset: options.offset ?? 0
    }
    return activityLogRepository.getLogs(client, opts)
}
    