/**
 * Leave Request Service
 * Business logic for leave/cuti operations
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as leaveRepository from '~~/server/repositories/leave-request.repository'
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

export async function getLeaveSummary(client: PoolClient, params: SearchLeaveRequestInput) {
    return leaveRepository.getLeaveSummary(client, params)
}
