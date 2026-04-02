import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import { logActivity } from '~~/server/services/activity-log.service'

import { sseEmitter } from '~~/server/utils/sse'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'ID user tidak valid')
    }

    return withTransaction(async (client) => {
        // Fetch user info before delete for logging
        const user = await userService.getUserById(client, id)
        await userService.deleteUser(client, id)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'DELETE',
            module: 'USER_MANAGEMENT',
            description: `Menghapus user: ${user?.username || id}`,
            metadata: { target_user_id: id }
        })

        // Keluarkan user secara real-time
        sseEmitter.emit('user_logout', id)

        return sendSuccess(event, null, 'User berhasil dihapus')
    })
}, [{ module: 'users', action: 'delete' }])
