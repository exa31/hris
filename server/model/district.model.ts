/**
 * District Model
 * Represents districts (kecamatan) in Indonesia
 */

import z from 'zod'

export const districtModel = z.object({
    id: z.number(),
    regency_id: z.number(),
    name: z.string().min(1).max(255),
})

export type District = z.infer<typeof districtModel>

export const createDistrictSchema = z.object({
    regency_id: z.number(),
    name: z.string().min(1).max(255),
})

export type CreateDistrictInput = z.infer<typeof createDistrictSchema>

export const updateDistrictSchema = z.object({
    id: z.number(),
    regency_id: z.number().optional(),
    name: z.string().min(1).max(255).optional(),
})

export type UpdateDistrictInput = z.infer<typeof updateDistrictSchema>
