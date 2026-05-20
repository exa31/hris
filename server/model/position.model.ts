import z from 'zod';

export const positionModel = z.object({
    id: z.number(),
    name: z.string().min(1).max(255),
    created_at: z.string().optional(),
    updated_at: z.string().optional()
});

export type Position = z.infer<typeof positionModel>;

export const createPositionSchema = z.object({
    name: z.string().min(1, 'Nama jabatan wajib diisi').max(255)
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
