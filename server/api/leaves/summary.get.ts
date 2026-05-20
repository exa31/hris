import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as leaveService from '~~/server/services/leave-request.service'
import { sendSuccess } from '~~/server/utils/response'
import { searchLeaveRequestSchema } from '~~/server/model/leave-request.model'
import { HttpError } from '~~/server/errors/HttpError'
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
        const data = await leaveService.getLeaveSummary(client, validation.data)
        return sendSuccess(event, data)
    })
}, [{ module: 'leaves', action: 'read' }])
