/**
 * Education Model
 * Represents education levels
 */

import z from 'zod'

export const educationModel = z.object({
    id: z.number(),
    name: z.string().min(1).max(255),
})

export type Education = z.infer<typeof educationModel>

export const createEducationSchema = z.object({
    name: z.string().min(1).max(255),
})

export type CreateEducationInput = z.infer<typeof createEducationSchema>

export const updateEducationSchema = z.object({
    id: z.number(),
    name: z.string().min(1).max(255).optional(),
})

export type UpdateEducationInput = z.infer<typeof updateEducationSchema>
