/**
 * Employee Address Model
 * Represents employee addresses
 */

import z from 'zod'

export const employeeAddressModel = z.object({
    id: z.number(),
    employee_id: z.number(),
    district_id: z.number(),
    full_address: z.string().min(1),
    created_at: z.string(),
    updated_at: z.string(),
})

export type EmployeeAddress = z.infer<typeof employeeAddressModel>

export const createEmployeeAddressSchema = z.object({
    employee_id: z.number(),
    district_id: z.number(),
    full_address: z.string().min(1),
})

export type CreateEmployeeAddressInput = z.infer<typeof createEmployeeAddressSchema>

export const updateEmployeeAddressSchema = z.object({
    id: z.number(),
    district_id: z.number().optional(),
    full_address: z.string().min(1).optional(),
})

export type UpdateEmployeeAddressInput = z.infer<typeof updateEmployeeAddressSchema>
