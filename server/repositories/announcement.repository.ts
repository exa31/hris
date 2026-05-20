/**
 * Announcement Repository
 * Database operations for company announcements
 */

import type { PoolClient } from 'pg'
import type { CreateAnnouncementInput, UpdateAnnouncementInput, SearchAnnouncementInput } from '~~/server/model/announcement.model'

export async function getAnnouncements(client: PoolClient, params: SearchAnnouncementInput) {
    const conditions: string[] = ['1=1']
    const values: any[] = []
    let paramIndex = 1

    if (params.search) {
        conditions.push(`(an.title ILIKE $${paramIndex} OR an.content ILIKE $${paramIndex})`)
        values.push(`%${params.search}%`)
        paramIndex++
    }

    if (params.priority) {
        conditions.push(`an.priority = $${paramIndex}`)
        values.push(params.priority)
        paramIndex++
    }

    if (params.is_active !== undefined) {
        conditions.push(`an.is_active = $${paramIndex}`)
        values.push(params.is_active)
        paramIndex++
    }

    const whereClause = conditions.join(' AND ')

    const countResult = await client.query(
        `SELECT COUNT(*) as total FROM announcements an WHERE ${whereClause}`,
        values
    )

    const total = parseInt(countResult.rows[0].total, 10)

    const dataResult = await client.query(
        `SELECT an.*,
                u.username as created_by_name,
                e.name as creator_name
         FROM announcements an
         JOIN users u ON an.created_by = u.id
         JOIN employees e ON u.employee_id = e.id
         WHERE ${whereClause}
         ORDER BY
            CASE an.priority
                WHEN 'Urgent' THEN 1
                WHEN 'Important' THEN 2
                ELSE 3
            END,
            an.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, params.limit, params.offset]
    )

    return { rows: dataResult.rows, total }
}

export async function getAnnouncementById(client: PoolClient, id: number) {
    const result = await client.query(
        `SELECT an.*,
                u.username as created_by_name,
                e.name as creator_name
         FROM announcements an
         JOIN users u ON an.created_by = u.id
         JOIN employees e ON u.employee_id = e.id
         WHERE an.id = $1`,
        [id]
    )
    return result.rows[0] || null
}

export async function createAnnouncement(client: PoolClient, data: CreateAnnouncementInput, createdBy: number) {
    const result = await client.query(
        `INSERT INTO announcements (title, content, priority, target_department, is_active, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.title, data.content, data.priority, data.target_department || null, data.is_active, createdBy]
    )
    return result.rows[0]
}

export async function updateAnnouncement(client: PoolClient, id: number, data: Partial<UpdateAnnouncementInput>) {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.title !== undefined) {
        fields.push(`title = $${paramIndex}`)
        values.push(data.title)
        paramIndex++
    }

    if (data.content !== undefined) {
        fields.push(`content = $${paramIndex}`)
        values.push(data.content)
        paramIndex++
    }

    if (data.priority !== undefined) {
        fields.push(`priority = $${paramIndex}`)
        values.push(data.priority)
        paramIndex++
    }

    if (data.target_department !== undefined) {
        fields.push(`target_department = $${paramIndex}`)
        values.push(data.target_department)
        paramIndex++
    }

    if (data.is_active !== undefined) {
        fields.push(`is_active = $${paramIndex}`)
        values.push(data.is_active)
        paramIndex++
    }

    fields.push(`updated_at = NOW()`)

    if (fields.length === 1) return null

    const result = await client.query(
        `UPDATE announcements SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        [...values, id]
    )
    return result.rows[0] || null
}

export async function deleteAnnouncement(client: PoolClient, id: number) {
    const result = await client.query(
        `DELETE FROM announcements WHERE id = $1 RETURNING id`,
        [id]
    )
    return result.rowCount! > 0
}

export async function getActiveAnnouncements(client: PoolClient, department?: string) {
    let query = `
        SELECT an.*,
               u.username as created_by_name,
               e.name as creator_name
        FROM announcements an
        JOIN users u ON an.created_by = u.id
        JOIN employees e ON u.employee_id = e.id
        WHERE an.is_active = true
    `
    const values: any[] = []

    if (department) {
        query += ` AND (an.target_department IS NULL OR an.target_department = $1)`
        values.push(department)
    } else {
        query += ` AND an.target_department IS NULL`
    }

    query += ` ORDER BY
        CASE an.priority
            WHEN 'Urgent' THEN 1
            WHEN 'Important' THEN 2
            ELSE 3
        END,
        an.created_at DESC
        LIMIT 10`

    const result = await client.query(query, values)
    return result.rows
}
