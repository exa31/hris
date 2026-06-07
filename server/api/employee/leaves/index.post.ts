import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import { employeeLeaveRequestSchema } from '~~/server/model/leave-request.model'
import * as leaveService from '~~/server/services/leave-request.service'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await readValidatedBody(event, (body) => employeeLeaveRequestSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(parsed.error).properties)
    }

    const userId = event.context.user.id

    return withTransaction(async (client) => {
        await leaveService.createEmployeeLeaveRequest(client, userId, parsed.data)
        return sendSuccess(event, { message: 'Pengajuan cuti berhasil' })
    })
}, [])
