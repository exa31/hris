import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { updateUserSchema } from '~~/server/model/user.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withAuth(async (event) => {
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
        return sendSuccess(event, data, 'User berhasil diperbarui')
    })
})
