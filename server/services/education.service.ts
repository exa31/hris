/**
 * Education Service
 * Business logic for education operations
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as educationRepository from '~~/server/repositories/education.repository'
import type { PoolClient } from 'pg'
import z from 'zod'

const createEducationSchema = z.object({
    name: z.string().min(1, 'Nama pendidikan harus diisi').max(255),
})

export async function getEducations(client: PoolClient) {
    return educationRepository.getEducations(client)
}

export async function createEducation(client: PoolClient, data: unknown) {
    const validation = createEducationSchema.safeParse(data)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Invalid request body',
            z.treeifyError(validation.error).properties
        )
    }

    const existing = await client.query(
        'SELECT id FROM educations WHERE LOWER(name) = LOWER($1)',
        [validation.data.name]
    )

    if (existing.rows.length > 0) {
        throw new HttpError(
            400,
            'DUPLICATE_EDUCATION',
            'Pendidikan dengan nama ini sudah ada'
        )
    }

    return educationRepository.createEducation(client, validation.data.name)
}

export async function getEmployeeEducations(client: PoolClient, employeeId: number) {
    return educationRepository.getEmployeeEducations(client, employeeId)
}

export async function syncEmployeeEducations(
    client: PoolClient,
    employeeId: number,
    educationIds: number[]
) {
    // Validate that all education IDs exist
    if (educationIds.length > 0) {
        const placeholders = educationIds.map((_, i) => `$${i + 1}`).join(',')
        const result = await client.query(
            `SELECT id FROM educations WHERE id IN (${placeholders})`,
            educationIds
        )

        if (result.rows.length !== educationIds.length) {
            throw new HttpError(
                400,
                'INVALID_EDUCATION_ID',
                'Beberapa ID pendidikan tidak valid'
            )
        }
    }

    return educationRepository.syncEmployeeEducations(client, employeeId, educationIds)
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
