/**
 * List Deleted Employees
 * GET /api/recovery/employees
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    const query = getQuery(event)
    
    return withTransaction(async (client) => {
        const result = await employeeService.getDeletedEmployees(client, query)
        return sendSuccess(event, result)
    })
}, [{ module: 'employees', action: 'manage' }])
