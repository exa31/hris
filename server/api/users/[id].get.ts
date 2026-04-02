import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'ID user tidak valid')
    }

    return withTransaction(async (client) => {
        const data = await userService.getUserById(client, id)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: 'USER_MANAGEMENT',
            description: `Melihat detail user: ${data?.username || id}`
        })

        return sendSuccess(event, data)
    })
}, [{ module: 'users', action: 'read' }])
