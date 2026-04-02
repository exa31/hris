import type { PoolClient } from 'pg'
import * as transportAllowanceRepository from '~~/server/repositories/transport-allowance.repository'
import { createTransportAllowanceSchema, updateTransportAllowanceSchema } from '~~/server/model/transport-allowance.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export const getTransportAllowances = async (
    client: PoolClient,
    options?: any
) => {
    return transportAllowanceRepository.getTransportAllowances(client, options)
}

export const getTransportAllowanceById = async (client: PoolClient, id: number) => {
    const allowance = await transportAllowanceRepository.getTransportAllowanceById(client, id)
    if (!allowance) {
        throw new HttpError(404, 'NOT_FOUND', 'Transport allowance record not found')
    }
    return allowance
}

export const createTransportAllowance = async (client: PoolClient, data: any) => {
    const validation = createTransportAllowanceSchema.safeParse(data)
    if (!validation.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(validation.error).properties)
    }

    // Check if duplicate for employee, month, year
    const exist = await transportAllowanceRepository.getTransportAllowances(client, {
        month: validation.data.month,
        year: validation.data.year,
        search: validation.data.employee_id.toString(), // hack search just to filter
        limit: 1
    })

    // Manual check duplicate because repository search is fuzzy
    const isDuplicate = exist.rows.some(r => r.employee_id === validation.data.employee_id && r.month === validation.data.month && r.year === validation.data.year)
    if (isDuplicate) {
        throw new HttpError(409, 'DUPLICATE', 'Data tunjangan untuk pegawai, bulan, dan tahun ini sudah ada')
    }

    return transportAllowanceRepository.createTransportAllowance(client, validation.data)
}

export const updateTransportAllowance = async (client: PoolClient, id: number, data: any) => {
    const validation = updateTransportAllowanceSchema.safeParse({ ...data, id })
    if (!validation.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(validation.error).properties)
    }

    const updated = await transportAllowanceRepository.updateTransportAllowance(client, id, validation.data)
    if (!updated) {
        throw new HttpError(404, 'NOT_FOUND', 'Transport allowance record not found')
    }
    return updated
}

export const deleteTransportAllowance = async (client: PoolClient, id: number) => {
    const deleted = await transportAllowanceRepository.deleteTransportAllowance(client, id)
    if (!deleted) {
        throw new HttpError(404, 'NOT_FOUND', 'Transport allowance record not found')
    }
    return { success: true }
}

export const getTransportSettings = async (client: PoolClient) => {
    const settings = await transportAllowanceRepository.getTransportSettings(client)
    if (!settings) {
        return {
            baseFare: 5000,
            tariffPerKm: 2000,
            minDistance: 5,
            maxDistance: 25,
            minWorkingDays: 19,
            updatedBy: 'System'
        }
    }
    return settings
}

export const updateTransportSettings = async (client: PoolClient, data: any) => {
    // Validate input
    if (!data || typeof data !== 'object') {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body')
    }

    const { baseFare, tariffPerKm, minDistance, maxDistance, minWorkingDays, updatedBy } = data

    if (typeof baseFare !== 'number' || baseFare < 0) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Base fare must be a positive number')
    }
    if (typeof tariffPerKm !== 'number' || tariffPerKm < 0) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Tariff per km must be a positive number')
    }
    if (typeof minDistance !== 'number' || minDistance < 0) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Min distance must be a positive number')
    }
    if (typeof maxDistance !== 'number' || maxDistance <= 0) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Max distance must be a positive number')
    }
    if (typeof minWorkingDays !== 'number' || minWorkingDays < 1) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Min working days must be at least 1')
    }
    if (minDistance >= maxDistance) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Min distance must be less than max distance')
    }

    return transportAllowanceRepository.updateTransportSettings(client, {
        baseFare,
        tariffPerKm,
        minDistance,
        maxDistance,
        minWorkingDays,
        updatedBy: updatedBy || 'System',
    })
}
