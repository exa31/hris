import { HttpError } from '~~/server/errors/HttpError'
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'Invalid employee ID')
    }

    return withTransaction(async (client) => {
        const data = await employeeService.getEmployeeById(client, id)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: 'EMPLOYEE_MANAGEMENT',
            description: `Melihat detail pegawai: ${data?.name || id}`
        })

        return sendSuccess(event, data)
    })
}, [{ module: 'employees', action: 'read' }])
