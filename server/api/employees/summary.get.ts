/**
 * Employee Summary Stats
 * GET /api/employees/summary
 */

import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const stats = await employeeService.getEmployeeStats(client)
        return sendSuccess(event, stats)
    })
}, [{ module: 'employees', action: 'read' }])
