import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import * as leaveService from '~~/server/services/leave-request.service'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const userId = event.context.user.id
        const data = await leaveService.getEmployeeLeaveRequests(client, userId)
        return sendSuccess(event, data)
    })
}, [])
