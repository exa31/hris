import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'
import { createUserSchema } from '~~/server/model/user.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await readValidatedBody(event, (body) => createUserSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data user tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const currentUser = event.context.user
        
        // Aturan: Hanya Super Admin yang boleh membuat user dengan role Super Admin
        if (parsed.data.role_id === 1 && currentUser.role_id !== 1) {
            throw new HttpError(403, 'FORBIDDEN', 'Hanya Super Admin yang dapat membuat user dengan role Super Admin')
        }

        const data = await userService.createUser(client, parsed.data)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'CREATE',
            module: 'USER_MANAGEMENT',
            description: `Menambahkan user baru: ${data.username}`,
            metadata: { user_id: data.id }
        })

        return sendSuccess(event, data, 'User berhasil dibuat', 'SUCCESS', 201)
    })
}, [{ module: 'users', action: 'create' }])
