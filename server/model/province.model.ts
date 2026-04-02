/**
 * Province Model
 * Represents provinces in Indonesia
 */

import z from 'zod'

export const provinceModel = z.object({
    id: z.number(),
    name: z.string().min(1).max(255),
})

export type Province = z.infer<typeof provinceModel>

export const createProvinceSchema = z.object({
    name: z.string().min(1).max(255),
})

export type CreateProvinceInput = z.infer<typeof createProvinceSchema>

export const updateProvinceSchema = z.object({
    id: z.number(),
    name: z.string().min(1).max(255).optional(),
})

export type UpdateProvinceInput = z.infer<typeof updateProvinceSchema>
