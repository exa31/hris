/**
 * Announcement Model
 * Represents company announcements
 */

import z from 'zod'

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent'

const announcementPriorityEnum = z.enum(['Normal', 'Important', 'Urgent'])

export const announcementModel = z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
    priority: announcementPriorityEnum,
    target_department: z.string().nullable().optional(),
    is_active: z.boolean(),
    created_by: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type Announcement = z.infer<typeof announcementModel>

export const createAnnouncementSchema = z.object({
    title: z.string().min(1, 'Judul tidak boleh kosong').max(255),
    content: z.string().min(1, 'Isi pengumuman tidak boleh kosong'),
    priority: announcementPriorityEnum.default('Normal'),
    target_department: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
})

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>

export const updateAnnouncementSchema = z.object({
    id: z.number(),
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional(),
    priority: announcementPriorityEnum.optional(),
    target_department: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
})

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>

export const searchAnnouncementSchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    offset: z.coerce.number().int().nonnegative().default(0),
    search: z.string().optional(),
    priority: z.string().optional(),
    is_active: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : undefined, z.boolean().optional()),
})

export type SearchAnnouncementInput = z.infer<typeof searchAnnouncementSchema>
