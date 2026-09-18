import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { searchDeletedUsersSchema } from '~~/server/model/user.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
        searchDeletedUsersSchema.safeParse(query)
    )

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Parameter query tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const result = await userService.getDeletedUsers(client, parsed.data)
        return sendSuccess(event, result)
    })
}, [{ module: 'users', action: 'manage' }])
