import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'
import { bulkUpdateStatusSchema } from '~~/server/model/employee.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await readValidatedBody(event, (body) => bulkUpdateStatusSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(parsed.error).properties)
    }

    const { ids, status } = parsed.data

    return withTransaction(async (client) => {
        const data = await employeeService.bulkUpdateStatus(client, ids, status)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'UPDATE',
            module: 'EMPLOYEE_MANAGEMENT',
            description: `Memperbarui massal status pegawai menjadi ${status} (${ids.length} data)`,
            metadata: { count: ids.length, status, updated_ids: ids }
        })

        return sendSuccess(event, data, 'Status pegawai berhasil diperbarui secara massal')
    })
}, [{ module: 'employees', action: 'update' }])
