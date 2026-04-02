import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { updateUserSchema } from '~~/server/model/user.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'
import { logActivity } from '~~/server/services/activity-log.service'

import { sseEmitter } from '~~/server/utils/sse'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')
    const body = await readBody(event)

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'ID user tidak valid')
    }

    const validation = updateUserSchema.safeParse({ ...body, id })

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data user tidak valid',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await userService.updateUser(client, id, validation.data)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'UPDATE',
            module: 'USER_MANAGEMENT',
            description: `Memperbarui data user: ${data.username}`,
            metadata: { target_user_id: data.id }
        })

        // Jika user dinonaktifkan atau diubah role-nya, tendang dari session
        if (validation.data.is_active === false) {
            sseEmitter.emit('user_logout', id);
        } else {
            // Beri tahu klien untuk memuat ulang permission/state-nya
            sseEmitter.emit('user_updated', id);
        }

        return sendSuccess(event, data, 'User berhasil diperbarui')
    })
}, [{ module: 'users', action: 'update' }])
