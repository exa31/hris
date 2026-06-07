import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import { logActivity } from '~~/server/services/activity-log.service'
import { updateRolePermissionsSchema } from '~~/server/model/role.model'
import z from 'zod'

import { sseEmitter } from '~~/server/utils/sse'

export default withPermission(async (event) => {
    const id = Number(event.context.params?.id)
    if (isNaN(id)) {
        throw new HttpError(400, 'INVALID_ID', 'ID role tidak valid')
    }

    const parsed = await readValidatedBody(event, (body) => updateRolePermissionsSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(parsed.error).properties)
    }

    const { name, permissionIds } = parsed.data

    return withTransaction(async (client) => {
        const data = await userService.updateRolePermissions(client, id, name, permissionIds)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'UPDATE',
            module: 'USER_MANAGEMENT',
            description: `Memperbarui role & hak akses: ${name}`,
            metadata: { role_id: id, permissions_count: permissionIds.length }
        })

        // Beri tahu clients (semua user yang menggunakan role_id ini) untuk me-refresh permission
        sseEmitter.emit('role_updated', id);

        return sendSuccess(event, data)
    })
}, [{ module: 'roles', action: 'manage' }])
