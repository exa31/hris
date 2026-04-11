import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'
import { sseEmitter } from '~~/server/utils/sse'

export default withPermission(async (event) => {
    const body = await readBody(event)
    const { ids } = body

    return withTransaction(async (client) => {
        const data = await employeeService.bulkDeleteEmployees(client, ids)

        // Force logout for user accounts that were soft-deleted during bulk delete.
        if (Array.isArray((data as any).deletedUserIds)) {
            for (const userId of (data as any).deletedUserIds) {
                sseEmitter.emit('user_logout', userId)
            }
        }
        
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
}, [{ module: 'employees', action: 'delete' }])
