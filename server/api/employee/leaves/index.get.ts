import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import * as leaveService from '~~/server/services/leave-request.service'
import { searchEmployeeLeaveRequestSchema } from '~~/server/model/leave-request.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
        searchEmployeeLeaveRequestSchema.safeParse(query)
    )

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Satu atau lebih parameter query tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const userId = event.context.user.id
        const data = await leaveService.getEmployeeLeaveRequests(client, userId, parsed.data)
        return sendSuccess(event, data)
    })
}, [])
