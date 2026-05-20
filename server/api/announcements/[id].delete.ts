import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as announcementService from '~~/server/services/announcement.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    const id = Number(getRouterParam(event, 'id'))

    return withTransaction(async (client) => {
        const data = await announcementService.deleteAnnouncement(client, id)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'DELETE',
            module: 'ANNOUNCEMENTS',
            description: `Menghapus pengumuman ID: ${id}`,
            metadata: { announcement_id: id }
        })

        return sendSuccess(event, data, 'Pengumuman berhasil dihapus')
    })
}, [{ module: 'announcements', action: 'delete' }])
