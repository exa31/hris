/**
 * Announcement Service
 * Business logic for company announcements
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as announcementRepository from '~~/server/repositories/announcement.repository'
import * as notificationRepo from '~~/server/repositories/notification.repository'
import { type CreateAnnouncementInput, type UpdateAnnouncementInput, type SearchAnnouncementInput } from '~~/server/model/announcement.model'
import type { PoolClient } from 'pg'

export async function getAnnouncements(client: PoolClient, params: SearchAnnouncementInput) {
    const limit = params.limit || 10
    const offset = params.offset || 0

    const { rows, total } = await announcementRepository.getAnnouncements(client, {
        ...params,
        limit,
        offset,
    })

    return {
        announcements: rows,
        pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function getAnnouncementById(client: PoolClient, id: number) {
    const announcement = await announcementRepository.getAnnouncementById(client, id)
    if (!announcement) {
        throw new HttpError(404, 'NOT_FOUND', 'Pengumuman tidak ditemukan')
    }
    return announcement
}

export async function createAnnouncement(client: PoolClient, data: CreateAnnouncementInput, createdBy: number) {
    const announcement = await announcementRepository.createAnnouncement(client, data, createdBy)
    if (announcement.is_active) {
        await notificationRepo.createNotification(client, {
            user_id: null,
            title: announcement.title,
            message: announcement.content,
            type: 'broadcast',
            icon: 'bi bi-megaphone-fill',
            link: '/announcements',
        }).catch(err => console.error('Failed to create notification from announcement:', err));
    }
    return announcement
}

export async function updateAnnouncement(client: PoolClient, id: number, data: UpdateAnnouncementInput) {
    const announcement = await announcementRepository.updateAnnouncement(client, id, data)
    if (!announcement) {
        throw new HttpError(404, 'NOT_FOUND', 'Pengumuman tidak ditemukan')
    }
    return announcement
}

export async function deleteAnnouncement(client: PoolClient, id: number) {
    const deleted = await announcementRepository.deleteAnnouncement(client, id)
    if (!deleted) {
        throw new HttpError(404, 'NOT_FOUND', 'Pengumuman tidak ditemukan')
    }
    return { success: true, message: 'Pengumuman berhasil dihapus' }
}

export async function getActiveAnnouncements(client: PoolClient, department?: string) {
    return announcementRepository.getActiveAnnouncements(client, department)
}

export async function getPublishedAnnouncements(client: PoolClient) {
    const rows = await announcementRepository.getPublishedAnnouncements(client)
    const announcements = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        created_at: r.created_at,
        author: {
            name: r.author_name,
            photo_url: r.author_photo,
        },
    }))
    return { announcements }
}
