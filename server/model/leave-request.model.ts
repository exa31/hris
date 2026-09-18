/**
 * Leave Request Model
 * Represents leave/cuti requests
 */

import z from 'zod'

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'

const leaveStatusEnum = z.enum(['Pending', 'Approved', 'Rejected'])

export const leaveRequestModel = z.object({
    id: z.number(),
    employee_id: z.number(),
    leave_type_id: z.number(),
    start_date: z.string(),
    end_date: z.string(),
    total_days: z.number(),
    reason: z.string(),
    status: leaveStatusEnum,
    approved_by: z.number().nullable().optional(),
    rejection_reason: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type LeaveRequest = z.infer<typeof leaveRequestModel>

export const createLeaveRequestSchema = z.object({
    employee_id: z.coerce.number({ error: 'Pegawai harus dipilih' }),
    leave_type_id: z.coerce.number({ error: 'Tipe cuti harus dipilih' }),
    start_date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Format tanggal mulai tidak valid' }),
    end_date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Format tanggal selesai tidak valid' }),
    total_days: z.coerce.number().int().positive('Jumlah hari harus positif'),
    reason: z.string().min(1, 'Alasan tidak boleh kosong'),
})

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>

export const approveLeaveSchema = z.object({
    status: leaveStatusEnum,
    rejection_reason: z.string().optional().nullable(),
})

export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>

export const searchLeaveRequestSchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    offset: z.coerce.number().int().nonnegative().default(0),
    search: z.string().optional(),
    employee_id: z.coerce.number().optional(),
    status: z.string().optional(),
    leave_type_id: z.coerce.number().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().optional(),
})

export type SearchLeaveRequestInput = z.infer<typeof searchLeaveRequestSchema>

export const leaveTypeModel = z.object({
    id: z.number(),
    name: z.string(),
    max_days: z.number(),
    description: z.string().nullable().optional(),
})

export type LeaveType = z.infer<typeof leaveTypeModel>

export const employeeLeaveRequestSchema = z.object({
  leave_type_id: z.coerce.number({ message: "Tipe cuti harus dipilih" }),
  start_date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Format tanggal mulai tidak valid" }),
  end_date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Format tanggal selesai tidak valid" }),
  total_days: z.coerce.number().int().positive("Jumlah hari harus positif"),
  reason: z.string().min(1, "Alasan tidak boleh kosong"),
})

export type EmployeeLeaveRequestInput = z.infer<typeof employeeLeaveRequestSchema>

export const searchEmployeeLeaveRequestSchema = z.object({
  limit: z.coerce.number().int().positive().default(10),
  offset: z.coerce.number().int().nonnegative().default(0),
  search: z.string().optional(),
  status: z.string().optional(),
})

export type SearchEmployeeLeaveRequestInput = z.infer<typeof searchEmployeeLeaveRequestSchema>

