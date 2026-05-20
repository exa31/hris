import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as announcementService from '~~/server/services/announcement.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

import { HttpError } from '~~/server/errors/HttpError'
import { createAnnouncementSchema } from '~~/server/model/announcement.model'
import z from 'zod'

export default withPermission(async (event) => {
    const body = await readBody(event)
    const validation = createAnnouncementSchema.safeParse(body)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data pengumuman tidak valid',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await announcementService.createAnnouncement(client, validation.data, event.context.user.id)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'CREATE',
            module: 'ANNOUNCEMENTS',
            description: `Membuat pengumuman: ${data.title}`,
            metadata: { announcement_id: data.id }
        })

        return sendSuccess(event, data, 'Pengumuman berhasil dibuat', 'SUCCESS', 201)
    })
}, [{ module: 'announcements', action: 'create' }])
