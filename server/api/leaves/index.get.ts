import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as leaveService from '~~/server/services/leave-request.service'
import { sendSuccess } from '~~/server/utils/response'
import { searchLeaveRequestSchema } from '~~/server/model/leave-request.model'
import { HttpError } from '~~/server/errors/HttpError'
import { logActivity } from '~~/server/services/activity-log.service'
import z from 'zod'

export default withPermission(async (event) => {
    const query = getQuery(event)
    const validation = searchLeaveRequestSchema.safeParse(query)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Parameter query tidak valid',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await leaveService.getLeaveRequests(client, validation.data)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: 'LEAVE_MANAGEMENT',
            description: 'Melihat daftar pengajuan cuti'
        })

        return sendSuccess(event, data)
    })
}, [{ module: 'leaves', action: 'read' }])
