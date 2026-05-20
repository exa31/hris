import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as leaveService from '~~/server/services/leave-request.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const data = await leaveService.getLeaveTypes(client)
        return sendSuccess(event, data)
    })
}, [{ module: 'leaves', action: 'read' }])
