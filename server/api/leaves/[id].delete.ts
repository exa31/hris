import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as leaveService from '~~/server/services/leave-request.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    const id = Number(getRouterParam(event, 'id'))

    return withTransaction(async (client) => {
        const data = await leaveService.deleteLeaveRequest(client, id)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'DELETE',
            module: 'LEAVE_MANAGEMENT',
            description: `Menghapus pengajuan cuti ID: ${id}`,
            metadata: { leave_request_id: id }
        })

        return sendSuccess(event, data, 'Pengajuan cuti berhasil dihapus')
    })
}, [{ module: 'leaves', action: 'delete' }])
