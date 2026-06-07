import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as leaveService from '~~/server/services/leave-request.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

import { HttpError } from '~~/server/errors/HttpError'
import { approveLeaveSchema } from '~~/server/model/leave-request.model'
import z from 'zod'

export default withPermission(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const parsed = await readValidatedBody(event, (body) => approveLeaveSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data approval tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await leaveService.approveLeaveRequest(client, id, parsed.data, event.context.user.id)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'UPDATE',
            module: 'LEAVE_MANAGEMENT',
            description: `${parsed.data.status === 'Approved' ? 'Menyetujui' : 'Menolak'} pengajuan cuti ID: ${id}`,
            metadata: { leave_request_id: id, status: parsed.data.status }
        })

        return sendSuccess(event, data, `Pengajuan cuti berhasil ${parsed.data.status === 'Approved' ? 'disetujui' : 'ditolak'}`)
    })
}, [{ module: 'leaves', action: 'approve' }])
