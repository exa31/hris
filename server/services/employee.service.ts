/**
 * Employee Service
 * Business logic for employee operations
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as employeeRepository from '~~/server/repositories/employee.repository'
import { createEmployeeSchema, updateEmployeeSchema, type SearchEmployeesInput } from '~~/server/model/employee.model'
import type { PoolClient } from 'pg'
import z from 'zod'

export async function getEmployees(
    client: PoolClient,
    params: SearchEmployeesInput
) {
    const limit = params.limit || 10
    const offset = params.offset || 0

    const { rows, total } = await employeeRepository.getEmployees(client, {
        limit,
        offset,
        search: params.search,
        department: params.department,
        status: params.status,
        sortColumn: params.sortColumn,
        sortDirection: params.sortDirection,
        positions: params.positions,
        tenureOperator: params.tenureOperator,
        tenureValue: params.tenureValue,
    })

    return {
        employees: rows,
        pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit),
        },
    }
}

export async function getEmployeeById(client: PoolClient, id: number) {
    const employee = await employeeRepository.getEmployeeById(client, id)

    if (!employee) {
        throw new HttpError(404, 'NOT_FOUND', 'Employee not found')
    }

    return employee
}

export async function createEmployee(client: PoolClient, data: unknown) {
    const validation = createEmployeeSchema.safeParse(data)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Invalid request body',
            z.treeifyError(validation.error).properties
        )
    }

    const employee = await employeeRepository.createEmployee(client, validation.data)
    return employee
}

export async function updateEmployee(client: PoolClient, id: number, data: unknown) {
    const validation = updateEmployeeSchema.safeParse(data)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Invalid request body',
            z.treeifyError(validation.error).properties
        )
    }

    const employee = await employeeRepository.updateEmployee(client, id, validation.data)

    if (!employee) {
        throw new HttpError(404, 'NOT_FOUND', 'Employee not found')
    }

    return employee
}

export async function deleteEmployee(client: PoolClient, id: number) {
    // Check if employee is superadmin
    const superAdmins = await employeeRepository.checkSuperAdminByIds(client, [id])

    if (superAdmins.length > 0) {
        throw new HttpError(403, 'FORBIDDEN', 'Pegawai dengan role SuperAdmin tidak dapat dihapus')
    }

    // Auto soft-delete linked user account(s) when deleting employee.
    const deletedUserIds = await employeeRepository.softDeleteUsersByEmployeeIds(client, [id])

    const deleted = await employeeRepository.deleteEmployee(client, id)

    if (!deleted) {
        throw new HttpError(404, 'NOT_FOUND', 'Employee not found')
    }

    return { success: true, message: 'Employee deleted successfully', deletedUserIds }
}

export async function bulkDeleteEmployees(client: PoolClient, ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body: ids array required')
    }

    // Check if any of these employees are superadmin
    const superAdmins = await employeeRepository.checkSuperAdminByIds(client, ids)

    if (superAdmins.length > 0) {
        const names = superAdmins.map(r => r.name).join(', ')
        throw new HttpError(403, 'FORBIDDEN', `Penghapusan massal gagal. Pegawai berikut memiliki role SuperAdmin dan tidak dapat dihapus: ${names}`)
    }

    // Auto soft-delete linked user account(s) for bulk deletion as well.
    const deletedUserIds = await employeeRepository.softDeleteUsersByEmployeeIds(client, ids)

    const count = await employeeRepository.bulkDeleteEmployees(client, ids)
    return { success: true, deletedCount: count, deletedUserIds }
}

export async function bulkUpdateStatus(client: PoolClient, ids: number[], status: boolean) {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body: ids array required')
    }

    if (typeof status !== 'boolean') {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body: status must be boolean')
    }

    const count = await employeeRepository.bulkUpdateStatus(client, ids, status)
    return { success: true, updatedCount: count }
}

export async function getDashboardStats(client: PoolClient) {
    return employeeRepository.getDashboardStats(client)
}

export async function getNewContractEmployees(client: PoolClient) {
    return employeeRepository.getNewContractEmployees(client)
}

/**
 * Get deleted employees (for recovery)
 */
export async function getDeletedEmployees(client: PoolClient, params: any) {
    const limit = params.limit || 10
    const offset = params.offset || 0
    const search = params.search

    const { rows, total } = await employeeRepository.getDeletedEmployees(client, { limit, offset, search })

    return {
        employees: rows,
        pagination: {
            total,
            limit,
            offset,
            pages: Math.ceil(total / limit),
        },
    }
}

/**
 * Restore a deleted employee
 */
export async function restoreEmployee(client: PoolClient, id: number) {
    const restored = await employeeRepository.restoreEmployee(client, id)
    if (!restored) {
        throw new HttpError(404, 'NOT_FOUND', 'Employee not found or not deleted')
    }
    return { success: true, message: 'Employee restored successfully' }
}
