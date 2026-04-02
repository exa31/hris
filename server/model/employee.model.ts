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
    nip: z.number().positive('NIP harus berupa angka positif'),
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
    role_name: z.string().optional().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    photo_url: z.string().nullable().optional(),
})

export type Employee = z.infer<typeof employeeModel>

export const createEmployeeSchema = z.object({
    nip: z.number().positive('NIP harus berupa angka positif'),
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
    district_id: z.number({ error: 'Kecamatan harus dipilih' }),
    full_address: z.string().optional(),
    educations: z.array(z.any()).optional(),
    educationIds: z.array(z.number()).optional(),
    photo_url: z.string().optional().nullable(),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>

export const updateEmployeeSchema = z.object({
    id: z.number(),
    nip: z.number().positive('NIP harus berupa angka positif').optional(),
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).max(20).optional(),
    birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }).optional(),
    marital_status: maritalStatusEnum.optional(),
    gender: genderEnum.optional(),
    children_count: z.number().nonnegative().optional(),
    join_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
    }).optional(),
    position: jabatanEnum.optional(),
    department: departemenEnum.optional(),
    status: z.boolean().optional(),
    type: employmentTypeEnum.optional(),
    birth_place_id: z.number().optional(),
    district_id: z.number().optional(),
    full_address: z.string().optional(),
    educationIds: z.array(z.number()).optional(),
    photo_url: z.string().optional().nullable(),
})

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

export const searchEmployeesSchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    offset: z.coerce.number().int().nonnegative().default(0),
    search: z.string().optional(),
    department: z.string().optional(),
    status: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : undefined, z.boolean().optional()),
    sortColumn: z.string().optional(),
    sortDirection: z.enum(['asc', 'desc']).default('desc'),
    positions: z.preprocess((val) => typeof val === 'string' ? val.split(',') : val, z.array(z.string()).optional()),
    tenureOperator: z.enum(['>', '<', '>=', '<=', '=']).optional(),
    tenureValue: z.coerce.number().int().nonnegative().optional(),
})

export type SearchEmployeesInput = z.infer<typeof searchEmployeesSchema>
