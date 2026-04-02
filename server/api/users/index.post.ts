import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'
import { createUserSchema } from '~~/server/model/user.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withAuth(async (event) => {
    const body = await readBody(event)
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data user tidak valid',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await userService.createUser(client, validation.data)
        
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
})
