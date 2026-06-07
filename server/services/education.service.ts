/**
 * Education Service
 * Business logic for education operations
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as educationRepository from '~~/server/repositories/education.repository'
import type { PoolClient } from 'pg'
import type { CreateEducationInput } from '~~/server/model/education.model'

export async function getEducations(client: PoolClient) {
    return educationRepository.getEducations(client)
}

export async function createEducation(client: PoolClient, data: CreateEducationInput) {
    const existing = await educationRepository.findEducationByName(client, data.name)

    if (existing) {
        throw new HttpError(
            400,
            'DUPLICATE_EDUCATION',
            'Pendidikan dengan nama ini sudah ada'
        )
    }

    return educationRepository.createEducation(client, data.name)
}

export async function getEmployeeEducations(client: PoolClient, employeeId: number) {
    return educationRepository.getEmployeeEducations(client, employeeId)
}

export async function deleteEducation(client: PoolClient, id: number) {
    const inUse = await educationRepository.isEducationInUse(client, id)
    if (inUse) {
        throw new HttpError(
            400,
            'EDUCATION_IN_USE',
            'Tidak bisa dihapus karena pendidikan ini masih digunakan oleh pegawai'
        )
    }
    return educationRepository.deleteEducation(client, id)
}
