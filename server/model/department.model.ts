import z from 'zod';

export const departmentModel = z.object({
    id: z.number(),
    name: z.string().min(1).max(255),
    created_at: z.string().optional(),
    updated_at: z.string().optional()
});

export type Department = z.infer<typeof departmentModel>;

export const createDepartmentSchema = z.object({
    name: z.string().min(1, 'Nama departemen wajib diisi').max(255)
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
