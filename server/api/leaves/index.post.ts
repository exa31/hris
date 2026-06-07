import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as leaveService from '~~/server/services/leave-request.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

import { HttpError } from '~~/server/errors/HttpError'
import { createLeaveRequestSchema } from '~~/server/model/leave-request.model'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await readValidatedBody(event, (body) => createLeaveRequestSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data pengajuan cuti tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await leaveService.createLeaveRequest(client, validation.data)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'CREATE',
            module: 'LEAVE_MANAGEMENT',
            description: `Mengajukan cuti untuk employee_id: ${data.employee_id}`,
            metadata: { leave_request_id: data.id }
        })

        return sendSuccess(event, data, 'Pengajuan cuti berhasil dibuat', 'SUCCESS', 201)
    })
}, [{ module: 'leaves', action: 'create' }])
