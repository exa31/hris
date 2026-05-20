/**
 * Get all departments
 * GET /api/departments
 */

import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as departmentRepository from '~~/server/repositories/department.repository'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const departments = await departmentRepository.getDepartments(client)
        return sendSuccess(event, departments)
    })
}, [{ module: 'employees', action: 'read' }])
