/**
 * Attendance Model
 * Represents daily attendance records
 */

import z from 'zod'

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpha'

const attendanceStatusEnum = z.enum(['Hadir', 'Izin', 'Sakit', 'Alpha'])

export const attendanceModel = z.object({
    id: z.number(),
    employee_id: z.number(),
    date: z.string(),
    clock_in: z.string().nullable().optional(),
    clock_out: z.string().nullable().optional(),
    status: attendanceStatusEnum,
    notes: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
})

export type Attendance = z.infer<typeof attendanceModel>

export const createAttendanceSchema = z.object({
    employee_id: z.number({ error: 'Pegawai harus dipilih' }),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Format tanggal tidak valid' }),
    clock_in: z.string().optional().nullable(),
    clock_out: z.string().optional().nullable(),
    status: attendanceStatusEnum.default('Hadir'),
    notes: z.string().optional().nullable(),
})

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>

export const updateAttendanceSchema = z.object({
    id: z.number(),
    clock_in: z.string().optional().nullable(),
    clock_out: z.string().optional().nullable(),
    status: attendanceStatusEnum.optional(),
    notes: z.string().optional().nullable(),
})

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>

export const searchAttendanceSchema = z.object({
    limit: z.coerce.number().int().default(10),
    offset: z.coerce.number().int().nonnegative().default(0),
    search: z.string().optional(),
    employee_id: z.coerce.number().optional(),
    status: z.string().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().optional(),
    date: z.string().optional(),
})

export type SearchAttendanceInput = z.infer<typeof searchAttendanceSchema>

export const attendanceClockSchema = z.object({
  type: z.enum(["in", "out"]),
})

export type AttendanceClockInput = z.infer<typeof attendanceClockSchema>

export const searchEmployeeAttendanceSchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    offset: z.coerce.number().int().nonnegative().default(0),
    search: z.string().optional(),
    status: z.string().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().optional(),
})

export type SearchEmployeeAttendanceInput = z.infer<typeof searchEmployeeAttendanceSchema>

export const searchEmployeeAttendanceStatsSchema = z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().optional(),
})

export type SearchEmployeeAttendanceStatsInput = z.infer<typeof searchEmployeeAttendanceStatsSchema>

export const attendanceSummarySchema = z.object({
    month: z.coerce.number().int().min(1).max(12).default(() => new Date().getMonth() + 1),
    year: z.coerce.number().int().min(2000).max(2100).default(() => new Date().getFullYear()),
})

export type AttendanceSummaryInput = z.infer<typeof attendanceSummarySchema>


