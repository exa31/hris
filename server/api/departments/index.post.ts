/**
 * Create new department
 * POST /api/departments
 */

import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as departmentRepository from '~~/server/repositories/department.repository'
import { createDepartmentSchema } from '~~/server/model/department.model'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'

export default withPermission(async (event) => {
    const body = await readBody(event)
    const validation = createDepartmentSchema.safeParse(body)

    if (!validation.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Nama departemen wajib diisi')
    }

    return withTransaction(async (client) => {
        const department = await departmentRepository.createDepartment(client, validation.data)
        return sendSuccess(event, department, 'Departemen berhasil ditambahkan')
    })
}, [{ module: 'employees', action: 'create' }])
