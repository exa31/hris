import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const body = await readBody(event)
    const { ids } = body

    return withTransaction(async (client) => {
        const data = await employeeService.bulkDeleteEmployees(client, ids)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'DELETE',
            module: 'EMPLOYEE_MANAGEMENT',
            description: `Menghapus massal data pegawai (${ids.length} data)`,
            metadata: { count: ids.length, deleted_ids: ids }
        })

        return sendSuccess(event, data, 'Pegawai berhasil dihapus secara massal')
    })
})
