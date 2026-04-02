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
    return transportAllowanceRepository.getTransportSettings(client)
}

export const updateTransportSettings = async (client: PoolClient, baseFare: number) => {
    if (typeof baseFare !== 'number' || baseFare < 0) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Base fare must be a positive number')
    }
    return transportAllowanceRepository.updateTransportSettings(client, baseFare)
}
