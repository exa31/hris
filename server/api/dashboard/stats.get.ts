/**
 * Dashboard Stats
 * GET /api/dashboard/stats
 */

import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

export default withAuth(async (event) => {
    return withTransaction(async (client) => {
        const data = await employeeService.getDashboardStats(client)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: 'DASHBOARD',
            description: 'Melihat statistik dashboard'
        })

        return sendSuccess(event, data)
    })
})

