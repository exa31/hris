/**
 * Employee Model
 * Represents employee information
 */

import z from 'zod'

export type Jabatan = 'Manager' | 'Staf' | 'Magang'
export type Departemen = 'Marketing' | 'HRD' | 'Production' | 'Executive' | 'Commissioner'
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed'
export type Gender = 'Male' | 'Female' | 'Other'
export type EmploymentType = 'Kontrak' | 'Tetap' | 'Magang'

const jabatanEnum = z.enum(['Manager', 'Staf', 'Magang'])
const departemenEnum = z.enum(['Marketing', 'HRD', 'Production', 'Executive', 'Commissioner'])
const maritalStatusEnum = z.enum(['Single', 'Married', 'Divorced', 'Widowed'])
const genderEnum = z.enum(['Male', 'Female', 'Other'])
const employmentTypeEnum = z.enum(['Kontrak', 'Tetap', 'Magang'])

export const employeeModel = z.object({
    id: z.number(),
    nip: z.number(),
    name: z.string().min(1).max(255),
    email: z.string().email(),
    phone: z.string().min(1).max(20),
    birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    marital_status: maritalStatusEnum,
    gender: genderEnum,
    children_count: z.number().nonnegative(),
    join_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    position: jabatanEnum,
    department: departemenEnum,
    status: z.boolean(),
    type: employmentTypeEnum,
    birth_place_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type Employee = z.infer<typeof employeeModel>

export const createEmployeeSchema = z.object({
    nip: z.number(),
    name: z.string().min(1).max(255),
    email: z.string().email(),
    phone: z.string().min(1).max(20),
    birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    marital_status: maritalStatusEnum,
    gender: genderEnum,
    children_count: z.number().nonnegative(),
    join_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }),
    position: jabatanEnum,
    department: departemenEnum,
    type: employmentTypeEnum,
    birth_place_id: z.number(),
    status: z.boolean().default(true),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>

export const updateEmployeeSchema = z.object({
    id: z.number(),
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).max(20).optional(),
    birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }).optional(),
    marital_status: maritalStatusEnum.optional(),
    gender: genderEnum.optional(),
    children_count: z.number().nonnegative().optional(),
    position: jabatanEnum.optional(),
    department: departemenEnum.optional(),
    status: z.boolean().optional(),
    type: employmentTypeEnum.optional(),
    birth_place_id: z.number().optional(),
})

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
