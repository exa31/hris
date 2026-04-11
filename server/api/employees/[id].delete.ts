import { HttpError } from '~~/server/errors/HttpError'
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'
import { sseEmitter } from '~~/server/utils/sse'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'Invalid employee ID')
    }

    return withTransaction(async (client) => {
        // Fetch employee info before delete for logging
        const employee = await employeeService.getEmployeeById(client, id)
        const data = await employeeService.deleteEmployee(client, id)

        // Force logout for user accounts that were soft-deleted with this employee.
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
            description: `Menghapus pegawai: ${employee?.name || id} (NIP: ${employee?.nip || '-'})`,
            metadata: { employee_id: id }
        })

        return sendSuccess(event, data, 'Pegawai berhasil dihapus')
    })
}, [{ module: 'employees', action: 'delete' }])
