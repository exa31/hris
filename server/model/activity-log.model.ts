/**
 * Activity Log Model
 * Represents system activity logs
 */

import z from 'zod'

export const activityLogModel = z.object({
    id: z.number(),
    user_id: z.number(),
    action: z.string().min(1).max(255),
    module: z.string().min(1).max(255),
    description: z.string().min(1),
    metadata: z.record(z.string(), z.any()).optional(),
    created_at: z.string(),
})

export type ActivityLog = z.infer<typeof activityLogModel>

export const createActivityLogSchema = z.object({
    user_id: z.number(),
    action: z.string().min(1).max(255),
    module: z.string().min(1).max(255),
    description: z.string().min(1),
    metadata: z.record(z.string(), z.any()).optional(),
})

export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>

export const findActivityLogFilterSchema = z.object({
    user_id: z.number().optional(),
    action: z.string().optional(),
    module: z.string().optional(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }).optional(),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }).optional(),
})

export type FindActivityLogFilter = z.infer<typeof findActivityLogFilterSchema>
