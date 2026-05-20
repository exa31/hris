/**
 * Attendance Service
 * Business logic for attendance operations
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as attendanceRepository from '~~/server/repositories/attendance.repository'
import { type CreateAttendanceInput, type UpdateAttendanceInput, type SearchAttendanceInput } from '~~/server/model/attendance.model'
import type { PoolClient } from 'pg'

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
