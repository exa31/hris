/**
 * Role Permission Model
 * Represents role permissions mapping
 */

import z from 'zod'

export const rolePermissionModel = z.object({
    id: z.number(),
    role_id: z.number(),
    permission_id: z.number(),
})

export type RolePermission = z.infer<typeof rolePermissionModel>

export const createRolePermissionSchema = z.object({
    role_id: z.number(),
    permission_id: z.number(),
})

export type CreateRolePermissionInput = z.infer<typeof createRolePermissionSchema>
