/**
 * Restore Deleted User
 * POST /api/recovery/users/:id/restore
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')
    
    return withTransaction(async (client) => {
        const result = await userService.restoreUser(client, id)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'RESTORE',
            module: 'RECOVERY',
            description: `Memulihkan data user dengan ID: ${id}`,
            metadata: { target_user_id: id, type: 'USER' }
        })
        
        return sendSuccess(event, result, 'User berhasil dipulihkan')
    })
}, [{ module: 'users', action: 'manage' }])
