import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'
import { searchEmployeesSchema } from '~~/server/model/employee.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'
import { logActivity } from '~~/server/services/activity-log.service'

export default withAuth(async (event) => {
    const query = getQuery(event)
    const validation = searchEmployeesSchema.safeParse(query)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Satu atau lebih parameter query tidak valid',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await employeeService.getEmployees(client, validation.data)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: 'EMPLOYEE_MANAGEMENT',
            description: 'Melihat daftar pegawai'
        })

        return sendSuccess(event, data)
    })
})
