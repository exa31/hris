import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const data = await userService.getRoles(client)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: 'USER_MANAGEMENT',
            description: 'Melihat daftar role'
        })

        return sendSuccess(event, data)
    })
})
