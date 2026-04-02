import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const body = await readBody(event)
    const { ids, status } = body

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
})
