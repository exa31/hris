/**
 * Leave Request Repository
 * Database operations for leave/cuti requests
 */

import type { PoolClient } from 'pg'
import type { CreateLeaveRequestInput, SearchLeaveRequestInput } from '~~/server/model/leave-request.model'

export async function getLeaveRequests(client: PoolClient, params: SearchLeaveRequestInput) {
    const conditions: string[] = ['1=1']
    const values: any[] = []
    let paramIndex = 1

    if (params.search) {
        conditions.push(`e.name ILIKE $${paramIndex}`)
        values.push(`%${params.search}%`)
        paramIndex++
    }

    if (params.employee_id) {
        conditions.push(`lr.employee_id = $${paramIndex}`)
        values.push(params.employee_id)
        paramIndex++
    }

    if (params.status) {
        conditions.push(`lr.status = $${paramIndex}`)
        values.push(params.status)
        paramIndex++
    }

    if (params.leave_type_id) {
        conditions.push(`lr.leave_type_id = $${paramIndex}`)
        values.push(params.leave_type_id)
        paramIndex++
    }

    if (params.month) {
        conditions.push(`EXTRACT(MONTH FROM lr.start_date) = $${paramIndex}`)
        values.push(params.month)
        paramIndex++
    }

    if (params.year) {
        conditions.push(`EXTRACT(YEAR FROM lr.start_date) = $${paramIndex}`)
        values.push(params.year)
        paramIndex++
    }

    const whereClause = conditions.join(' AND ')

    const countResult = await client.query(
        `SELECT COUNT(*) as total FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         WHERE ${whereClause}`,
        values
    )

    const total = parseInt(countResult.rows[0].total, 10)

    const dataResult = await client.query(
        `SELECT lr.*, e.name as employee_name, e.nip, d.name as department,
                lt.name as leave_type_name, lt.max_days,
                u.username as approved_by_name
         FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN users u ON lr.approved_by = u.id
         WHERE ${whereClause}
         ORDER BY lr.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, params.limit, params.offset]
    )

    return { rows: dataResult.rows, total }
}

export async function getLeaveRequestById(client: PoolClient, id: number) {
    const result = await client.query(
        `SELECT lr.*, e.name as employee_name, e.nip, d.name as department,
                lt.name as leave_type_name, lt.max_days,
                u.username as approved_by_name
         FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN users u ON lr.approved_by = u.id
         WHERE lr.id = $1`,
        [id]
    )
    return result.rows[0] || null
}

export async function createLeaveRequest(client: PoolClient, data: CreateLeaveRequestInput) {
    const result = await client.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.employee_id, data.leave_type_id, data.start_date, data.end_date, data.total_days, data.reason]
    )
    return result.rows[0]
}

export async function updateLeaveStatus(
    client: PoolClient,
    id: number,
    status: string,
    approvedBy: number,
    rejectionReason?: string | null
) {
    const result = await client.query(
        `UPDATE leave_requests
         SET status = $1, approved_by = $2, rejection_reason = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status, approvedBy, rejectionReason || null, id]
    )
    return result.rows[0] || null
}

export async function deleteLeaveRequest(client: PoolClient, id: number) {
    const result = await client.query(
        `DELETE FROM leave_requests WHERE id = $1 RETURNING id`,
        [id]
    )
    return result.rowCount! > 0
}

export async function getLeaveTypes(client: PoolClient) {
    const result = await client.query(`SELECT * FROM leave_types ORDER BY id`)
    return result.rows
}

export async function getLeaveBalance(client: PoolClient, employeeId: number, leaveTypeId: number, year: number) {
    // Get max days for the leave type
    const typeResult = await client.query(
        `SELECT max_days FROM leave_types WHERE id = $1`,
        [leaveTypeId]
    )

    if (typeResult.rows.length === 0) return null

    const maxDays = typeResult.rows[0].max_days

    // Get used days this year
    const usedResult = await client.query(
        `SELECT COALESCE(SUM(total_days), 0) as used_days
         FROM leave_requests
         WHERE employee_id = $1
           AND leave_type_id = $2
           AND EXTRACT(YEAR FROM start_date) = $3
           AND status = 'Approved'`,
        [employeeId, leaveTypeId, year]
    )

    const usedDays = parseInt(usedResult.rows[0].used_days, 10)

    return {
        max_days: maxDays,
        used_days: usedDays,
        remaining_days: maxDays - usedDays,
    }
}

export async function getLeaveSummary(client: PoolClient, params: SearchLeaveRequestInput) {
    const conditions: string[] = ['1=1']
    const values: any[] = []
    let paramIndex = 1

    if (params.search) {
        conditions.push(`e.name ILIKE $${paramIndex}`)
        values.push(`%${params.search}%`)
        paramIndex++
    }

    if (params.employee_id) {
        conditions.push(`lr.employee_id = $${paramIndex}`)
        values.push(params.employee_id)
        paramIndex++
    }

    if (params.status) {
        conditions.push(`lr.status = $${paramIndex}`)
        values.push(params.status)
        paramIndex++
    }

    if (params.leave_type_id) {
        conditions.push(`lr.leave_type_id = $${paramIndex}`)
        values.push(params.leave_type_id)
        paramIndex++
    }

    if (params.month) {
        conditions.push(`EXTRACT(MONTH FROM lr.start_date) = $${paramIndex}`)
        values.push(params.month)
        paramIndex++
    }

    if (params.year) {
        conditions.push(`EXTRACT(YEAR FROM lr.start_date) = $${paramIndex}`)
        values.push(params.year)
        paramIndex++
    }

    const whereClause = conditions.join(' AND ')

    const result = await client.query(
        `SELECT 
            COUNT(*) FILTER (WHERE lr.status = 'Pending') as pending,
            COUNT(*) FILTER (WHERE lr.status = 'Approved') as approved,
            COUNT(*) FILTER (WHERE lr.status = 'Rejected') as rejected
         FROM leave_requests lr
         JOIN employees e ON lr.employee_id = e.id
         WHERE ${whereClause}`,
        values
    )

    return {
        pending: parseInt(result.rows[0].pending, 10),
        approved: parseInt(result.rows[0].approved, 10),
        rejected: parseInt(result.rows[0].rejected, 10),
    }
}
