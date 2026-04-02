/**
 * Employee Education Model
 * Represents employee education history
 */

import z from 'zod'

export const employeeEducationModel = z.object({
    id: z.number(),
    employee_id: z.number(),
    education_id: z.number(),
})

export type EmployeeEducation = z.infer<typeof employeeEducationModel>

export const createEmployeeEducationSchema = z.object({
    employee_id: z.number(),
    education_id: z.number(),
})

export type CreateEmployeeEducationInput = z.infer<typeof createEmployeeEducationSchema>
