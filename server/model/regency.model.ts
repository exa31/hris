/**
 * Regency Model
 * Represents regencies (kabupaten/kota) in Indonesia
 */

import z from 'zod'

export const regencyModel = z.object({
    id: z.number(),
    province_id: z.number(),
    name: z.string().min(1).max(255),
})

export type Regency = z.infer<typeof regencyModel>

export const createRegencySchema = z.object({
    province_id: z.number(),
    name: z.string().min(1).max(255),
})

export type CreateRegencyInput = z.infer<typeof createRegencySchema>

export const updateRegencySchema = z.object({
    id: z.number(),
    province_id: z.number().optional(),
    name: z.string().min(1).max(255).optional(),
})

export type UpdateRegencyInput = z.infer<typeof updateRegencySchema>
