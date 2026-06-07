import type { PoolClient } from 'pg'
import * as departmentRepository from '~~/server/repositories/department.repository'
import type { CreateDepartmentInput } from '~~/server/model/department.model'

export async function getDepartments(client: PoolClient) {
    return departmentRepository.getDepartments(client)
}

export async function createDepartment(client: PoolClient, data: CreateDepartmentInput) {
    return departmentRepository.createDepartment(client, data)
}
