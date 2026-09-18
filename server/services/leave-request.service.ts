/**
 * Leave Request Service
 * Business logic for leave/cuti operations
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as leaveRepository from '~~/server/repositories/leave-request.repository'
import * as userRepository from '~~/server/repositories/user.repository'
import * as attendanceRepository from '~~/server/repositories/attendance.repository'
import * as workScheduleRepo from '~~/server/repositories/work-schedule.repository'
import * as holidayRepo from '~~/server/repositories/holiday.repository'
import { type CreateLeaveRequestInput, type ApproveLeaveInput, type SearchLeaveRequestInput } from '~~/server/model/leave-request.model'
import type { PoolClient } from 'pg'

export async function getLeaveRequests(client: PoolClient, params: SearchLeaveRequestInput) {
    const limit = params.limit || 10
    const offset = params.offset || 0

    const { rows, total } = await leaveRepository.getLeaveRequests(client, {
        ...params,
        limit,
        offset,
    })

    return {
        leaveRequests: rows,
        pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function getLeaveRequestById(client: PoolClient, id: number) {
    const request = await leaveRepository.getLeaveRequestById(client, id)
    if (!request) {
        throw new HttpError(404, 'NOT_FOUND', 'Pengajuan cuti tidak ditemukan')
    }
    return request
}

export async function createLeaveRequest(client: PoolClient, data: CreateLeaveRequestInput) {
    // Check leave balance
    const currentYear = new Date(data.start_date).getFullYear()
    const balance = await leaveRepository.getLeaveBalance(
        client,
        data.employee_id,
        data.leave_type_id,
        currentYear
    )

    if (balance && balance.remaining_days < data.total_days) {
        throw new HttpError(
            400,
            'INSUFFICIENT_BALANCE',
            `Sisa cuti tidak mencukupi. Tersisa ${balance.remaining_days} hari, diminta ${data.total_days} hari`
        )
    }

    const request = await leaveRepository.createLeaveRequest(client, data)
    return request
}

export async function approveLeaveRequest(client: PoolClient, id: number, data: ApproveLeaveInput, approvedBy: number) {
    // Check if request exists and is still pending
    const existing = await leaveRepository.getLeaveRequestById(client, id)
    if (!existing) {
        throw new HttpError(404, 'NOT_FOUND', 'Pengajuan cuti tidak ditemukan')
    }

    if (existing.status !== 'Pending') {
        throw new HttpError(400, 'ALREADY_PROCESSED', 'Pengajuan cuti sudah diproses sebelumnya')
    }

    const updated = await leaveRepository.updateLeaveStatus(
        client,
        id,
        data.status,
        approvedBy,
        data.rejection_reason
    )

    if (data.status === 'Approved') {
        const start = new Date(existing.start_date)
        const end = new Date(existing.end_date)
        const leaveTypeName = (existing.leave_type_name || '').toLowerCase()
        
        let attendanceStatus = 'Izin'
        if (leaveTypeName.includes('sakit') || leaveTypeName.includes('sick')) {
            attendanceStatus = 'Sakit'
        }

        const startStr = typeof existing.start_date === 'string' ? existing.start_date : existing.start_date.toISOString().slice(0, 10)
        const endStr = typeof existing.end_date === 'string' ? existing.end_date : existing.end_date.toISOString().slice(0, 10)

        const scheduleMap = await workScheduleRepo.getWorkScheduleMap(client)
        const holidays = await holidayRepo.getHolidaysBetweenDates(client, startStr, endStr)
        const holidayDates = new Set(holidays.map(h => h.date))

        let currentDate = new Date(start)
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay()
            const daySchedule = scheduleMap.get(dayOfWeek)
            const isWeeklyWorkDay = daySchedule ? daySchedule.is_work_day : (dayOfWeek !== 0 && dayOfWeek !== 6)

            const y = currentDate.getFullYear()
            const m = String(currentDate.getMonth() + 1).padStart(2, '0')
            const d = String(currentDate.getDate()).padStart(2, '0')
            const dateStr = `${y}-${m}-${d}`

            // Only generate attendance if it is an active work day AND not a holiday
            if (isWeeklyWorkDay && !holidayDates.has(dateStr)) {
                const { row: existingAttendance } = await attendanceRepository.getTodayAttendance(client, existing.employee_id, dateStr)
                
                if (existingAttendance) {
                    await attendanceRepository.updateAttendance(client, existingAttendance.id, {
                        status: attendanceStatus,
                        notes: `Leave: ${existing.reason}`
                    })
                } else {
                    await attendanceRepository.createAttendance(client, {
                        employee_id: existing.employee_id,
                        date: dateStr,
                        status: attendanceStatus,
                        notes: `Leave: ${existing.reason}`
                    })
                }
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }
    }

    return updated
}

export async function deleteLeaveRequest(client: PoolClient, id: number) {
    // Only allow deleting pending requests
    const existing = await leaveRepository.getLeaveRequestById(client, id)
    if (!existing) {
        throw new HttpError(404, 'NOT_FOUND', 'Pengajuan cuti tidak ditemukan')
    }

    if (existing.status !== 'Pending') {
        throw new HttpError(400, 'CANNOT_DELETE', 'Hanya pengajuan dengan status Pending yang dapat dihapus')
    }

    const deleted = await leaveRepository.deleteLeaveRequest(client, id)
    if (!deleted) {
        throw new HttpError(404, 'NOT_FOUND', 'Pengajuan cuti tidak ditemukan')
    }
    return { success: true, message: 'Pengajuan cuti berhasil dihapus' }
}

export async function getLeaveTypes(client: PoolClient) {
    return leaveRepository.getLeaveTypes(client)
}

export async function getLeaveBalance(client: PoolClient, employeeId: number, leaveTypeId: number, year: number) {
    const balance = await leaveRepository.getLeaveBalance(client, employeeId, leaveTypeId, year)
    if (!balance) {
        throw new HttpError(404, 'NOT_FOUND', 'Tipe cuti tidak ditemukan')
    }
    return balance
}

export async function getEmployeeLeaveRequests(
    client: PoolClient,
    userId: number,
    params: leaveRepository.EmployeeLeaveQueryParams = {}
) {
    const employeeId = await userRepository.getEmployeeIdByUserId(client, userId)
    if (!employeeId) {
        return {
            leaves: [],
            pagination: { total: 0, limit: params.limit ?? 10, offset: params.offset ?? 0, pages: 0 },
            stats: { pending: 0, approved: 0, rejected: 0, used_annual: 0, annual_balance: 12 },
        }
    }

    const [{ rows, total }, stats] = await Promise.all([
        leaveRepository.getEmployeeLeaveRequests(client, employeeId, params),
        leaveRepository.getEmployeeLeaveStats(client, employeeId),
    ])

    const limit = params.limit ?? 10
    const offset = params.offset ?? 0

    return {
        leaves: rows,
        pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit),
        },
        stats,
    }
}

export async function createEmployeeLeaveRequest(client: PoolClient, userId: number, data: Omit<CreateLeaveRequestInput, 'employee_id'>) {
    const employeeId = await userRepository.getEmployeeIdByUserId(client, userId)
    if (!employeeId) throw new HttpError(400, 'NO_EMPLOYEE', 'User ini bukan pegawai.')

    return createLeaveRequest(client, { ...data, employee_id: employeeId })
}

export async function getLeaveSummary(client: PoolClient, params: SearchLeaveRequestInput) {
    return leaveRepository.getLeaveSummary(client, params)
}
