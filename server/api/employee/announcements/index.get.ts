import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import * as announcementService from '~~/server/services/announcement.service'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const data = await announcementService.getPublishedAnnouncements(client)
        return sendSuccess(event, data)
    })
}, [])
