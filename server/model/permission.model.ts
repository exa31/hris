/**
 * Permission Model
 * Represents system permissions
 */

import z from 'zod'

export const permissionModel = z.object({
    id: z.number(),
    name: z.string().min(1).max(255),
    module: z.string().min(1).max(255),
    action: z.string().min(1).max(255),
})

export type Permission = z.infer<typeof permissionModel>

export const createPermissionSchema = z.object({
    name: z.string().min(1).max(255),
    module: z.string().min(1).max(255),
    action: z.string().min(1).max(255),
})

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>

export const updatePermissionSchema = z.object({
    id: z.number(),
    name: z.string().min(1).max(255).optional(),
    module: z.string().min(1).max(255).optional(),
    action: z.string().min(1).max(255).optional(),
})

export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>
