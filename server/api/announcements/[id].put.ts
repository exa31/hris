import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as announcementService from '~~/server/services/announcement.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

import { HttpError } from '~~/server/errors/HttpError'
import { updateAnnouncementSchema } from '~~/server/model/announcement.model'
import z from 'zod'

export default withPermission(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    const validation = updateAnnouncementSchema.safeParse({ ...body, id })

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data pengumuman tidak valid',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await announcementService.updateAnnouncement(client, id, validation.data)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'UPDATE',
            module: 'ANNOUNCEMENTS',
            description: `Mengubah pengumuman ID: ${id}`,
            metadata: { announcement_id: id }
        })

        return sendSuccess(event, data, 'Pengumuman berhasil diubah')
    })
}, [{ module: 'announcements', action: 'update' }])
