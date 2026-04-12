import z from 'zod'

export const userStatusEnum = z.boolean().default(true)

export const passwordSchema = z.string()
    .min(8, 'Minimal 8 karakter')
    .max(100)
    .regex(/[A-Z]/, 'Minimal 1 huruf besar')
    .regex(/[a-z]/, 'Minimal 1 huruf kecil')
    .regex(/[0-9]/, 'Minimal 1 angka')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Minimal 1 karakter khusus')
    .refine((val) => !val.includes(' '), 'Tidak boleh ada spasi')

export const usernameSchema = z.string()
    .min(6, 'Minimal 6 karakter')
    .max(50)
    .regex(/^[a-z0-9.]+$/, 'Hanya boleh huruf kecil, angka, dan titik (.)')
    .refine((val) => !val.includes(' '), 'Tidak boleh ada spasi')

export const userModel = z.object({
    id: z.number(),
    employee_id: z.number().positive(),
    username: usernameSchema,
    is_active: userStatusEnum,
    role_id: z.number().positive(),
    password_hash: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    // Added for convenience in lists
    employee_name: z.string().optional(),
    employee_photo_url: z.string().nullable().optional(),
    role_name: z.string().optional(),
})

export type User = z.infer<typeof userModel>

export const createUserSchema = z.object({
    employee_id: z.number().int().positive('ID Pegawai harus valid'),
    username: usernameSchema,
    password: passwordSchema,
    role_id: z.number().int().positive('Role harus dipilih'),
    is_active: userStatusEnum,
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const loginSchema = z.object({
    username: z.string().min(1, 'Username harus diisi'),
    password: z.string().min(1, 'Password harus diisi'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const updateUserSchema = z.object({
    id: z.number().int().positive(),
    username: usernameSchema.optional(),
    password: passwordSchema.optional(), // Only if changed
    role_id: z.number().int().positive().optional(),
    is_active: userStatusEnum.optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const searchUsersSchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    offset: z.coerce.number().int().nonnegative().default(0),
    search: z.string().optional(),
    role_id: z.coerce.number().int().positive().optional(),
    is_active: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : undefined, z.boolean().optional()),
    sortColumn: z.string().optional().default('created_at'),
    sortDirection: z.enum(['asc', 'desc']).default('desc'),
})

export type SearchUsersInput = z.infer<typeof searchUsersSchema>