/**
 * Role Model
 * Represents user roles in the system
 */

import z from 'zod'

export const roleModel = z.object({
    id: z.number(),
    name: z.string().min(1).max(255),
})

export type Role = z.infer<typeof roleModel>

export const createRoleSchema = z.object({
    name: z.string().min(1).max(255),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
    id: z.number(),
    name: z.string().min(1).max(255).optional(),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>

export const updateRolePermissionsSchema = z.object({
  name: z.string().min(1, "Nama role harus diisi"),
  permissionIds: z.array(z.number().int().positive()).min(1, "Minimal 1 permission harus dipilih"),
})

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>
