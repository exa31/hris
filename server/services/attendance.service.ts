/**
 * Attendance Service
 * Business logic for attendance operations
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as attendanceRepository from '~~/server/repositories/attendance.repository'
import * as leaveRepository from '~~/server/repositories/leave-request.repository'
import { type CreateAttendanceInput, type UpdateAttendanceInput, type SearchAttendanceInput } from '~~/server/model/attendance.model'
import type { PoolClient } from 'pg'
import * as userRepository from '~~/server/repositories/user.repository'
import * as workScheduleService from '~~/server/services/work-schedule.service'

export async function getAttendances(client: PoolClient, params: SearchAttendanceInput) {
    const limit = params.limit || 10
    const offset = params.offset || 0

    const { rows, total } = await attendanceRepository.getAttendances(client, {
        ...params,
        limit,
        offset,
    })

    return {
        attendances: rows,
        pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function getAttendanceById(client: PoolClient, id: number) {
    const attendance = await attendanceRepository.getAttendanceById(client, id)
    if (!attendance) {
        throw new HttpError(404, 'NOT_FOUND', 'Data absensi tidak ditemukan')
    }
    return attendance
}

export async function createAttendance(client: PoolClient, data: CreateAttendanceInput) {
    const attendance = await attendanceRepository.createAttendance(client, data)
    return attendance
}

export async function updateAttendance(client: PoolClient, id: number, data: UpdateAttendanceInput) {
    const attendance = await attendanceRepository.updateAttendance(client, id, data)
    if (!attendance) {
        throw new HttpError(404, 'NOT_FOUND', 'Data absensi tidak ditemukan')
    }
    return attendance
}

export async function deleteAttendance(client: PoolClient, id: number) {
    const deleted = await attendanceRepository.deleteAttendance(client, id)
    if (!deleted) {
        throw new HttpError(404, 'NOT_FOUND', 'Data absensi tidak ditemukan')
    }
    return { success: true, message: 'Data absensi berhasil dihapus' }
}

export async function getAttendanceSummary(client: PoolClient, month: number, year: number) {
    return attendanceRepository.getAttendanceSummary(client, month, year)
}

export async function getTodayStats(client: PoolClient) {
    return attendanceRepository.getTodayStats(client)
}

export async function getEmployeeMonthlyStats(client: PoolClient, employeeId: number) {
    return attendanceRepository.getEmployeeMonthlyAttendance(client, employeeId)
}

export async function getEmployeeAttendanceHistory(
  client: PoolClient,
  userId: number,
  params: attendanceRepository.EmployeeAttendanceQueryParams = {}
) {
  const employeeId = await userRepository.getEmployeeIdByUserId(client, userId)
  if (!employeeId) {
    return {
      attendances: [],
      pagination: { total: 0, limit: params.limit ?? 10, offset: params.offset ?? 0, pages: 0 },
      today: null,
    }
  }

  const { rows, total } = await attendanceRepository.getEmployeeAttendancesPaginated(
    client,
    employeeId,
    params
  )

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  const { row: todayAttendance } = await attendanceRepository.getTodayAttendance(client, employeeId, todayStr)

  const limit = params.limit ?? 10
  const offset = params.offset ?? 0

  return {
    attendances: rows,
    pagination: {
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    },
    today: todayAttendance ? {
      hasClockedIn: !!todayAttendance.clock_in,
      hasClockedOut: !!todayAttendance.clock_out,
      clock_in: todayAttendance.clock_in,
      clock_out: todayAttendance.clock_out,
    } : null,
  }
}

export async function getEmployeeAttendanceStats(
  client: PoolClient,
  userId: number,
  params: { month?: number; year?: number } = {}
) {
  const employeeId = await userRepository.getEmployeeIdByUserId(client, userId)
  if (!employeeId) {
    return { on_time: 0, late: 0, leave: 0, sick: 0, absent: 0, total: 0 }
  }

  return attendanceRepository.getEmployeeAttendanceStats(client, employeeId, params)
}

export async function clockIn(client: PoolClient, userId: number) {
    const employeeId = await userRepository.getEmployeeIdByUserId(client, userId)
    if (!employeeId) throw new HttpError(400, 'NO_EMPLOYEE', 'User ini bukan pegawai.')

    const now = new Date()
    const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    const currentTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false })

    const { row } = await attendanceRepository.getTodayAttendance(client, employeeId, today)
    if (row) throw new HttpError(400, 'ALREADY_CLOCKED_IN', 'Anda sudah melakukan clock in hari ini.')

    await attendanceRepository.insertAttendance(client, employeeId, today, currentTime, 'Hadir')
    return { message: 'Clock in success' }
}

export async function clockOut(client: PoolClient, userId: number) {
    const employeeId = await userRepository.getEmployeeIdByUserId(client, userId)
    if (!employeeId) throw new HttpError(400, 'NO_EMPLOYEE', 'User ini bukan pegawai.')

    const now = new Date()
    const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    const currentTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour12: false })

    const { row } = await attendanceRepository.getTodayAttendance(client, employeeId, today)
    if (!row) throw new HttpError(400, 'NOT_CLOCKED_IN', 'Anda belum melakukan clock in hari ini.')
    if (row.clock_out) throw new HttpError(400, 'ALREADY_CLOCKED_OUT', 'Anda sudah melakukan clock out hari ini.')

    await attendanceRepository.updateClockOut(client, row.id, currentTime)
    return { message: 'Clock out success' }
}

export async function getEmployeeDashboard(client: PoolClient, userId: number) {
    const workSchedule = await workScheduleService.getWorkSchedulePolicy(client)

    const employeeId = await userRepository.getEmployeeIdByUserId(client, userId)
    if (!employeeId) {
        return {
            attendancePercentage: 100,
            leavesRemaining: 12,
            pendingLeaves: 0,
            workSchedule,
            annualLeavePolicy: {
                maxDays: 12,
                text: 'Annual leave applications should ideally be submitted at least 3 business days in advance for management approval.'
            }
        }
    }

    const { total, present } = await attendanceRepository.getEmployeeMonthlyAttendance(client, employeeId)
    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 100

    const leaves = await leaveRepository.getEmployeeYearlyLeaves(client, employeeId)
    const pendingLeaves = leaves.filter((r: any) => r.status === 'Pending').length
    const approvedLeaves = leaves.filter((r: any) => r.status === 'Approved').length
    const leavesRemaining = Math.max(0, 12 - approvedLeaves)

    return {
        attendancePercentage,
        leavesRemaining,
        pendingLeaves,
        workSchedule,
        annualLeavePolicy: {
            maxDays: 12,
            text: 'Annual leave applications should ideally be submitted at least 3 business days in advance for management approval.'
        }
    }
}
