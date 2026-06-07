import { HttpError } from '~~/server/errors/HttpError'
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'
import { updateEmployeeSchema } from '~~/server/model/employee.model'
import z from 'zod'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'Invalid employee ID')
    }

    const parsed = await readValidatedBody(event, (body) => updateEmployeeSchema.safeParse({ ...(body || {}), id }))

    if (!parsed.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(parsed.error).properties)
    }

    return withTransaction(async (client) => {
        const data = await employeeService.updateEmployee(client, id, parsed.data)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'UPDATE',
            module: 'EMPLOYEE_MANAGEMENT',
            description: `Memperbarui data pegawai: ${data.name}`,
            metadata: { employee_id: data.id }
        })

        return sendSuccess(event, data, 'Data pegawai berhasil diperbarui')
    })
}, [{ module: 'employees', action: 'update' }])
