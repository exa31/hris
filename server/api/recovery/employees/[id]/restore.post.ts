/**
 * Restore Deleted Employee
 * POST /api/recovery/employees/:id/restore
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')
    
    return withTransaction(async (client) => {
        const result = await employeeService.restoreEmployee(client, id)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'RESTORE',
            module: 'RECOVERY',
            description: `Memulihkan data pegawai dengan ID: ${id}`,
            metadata: { target_id: id, type: 'EMPLOYEE' }
        })
        
        return sendSuccess(event, result, 'Pegawai berhasil dipulihkan')
    })
}, [{ module: 'employees', action: 'manage' }])
