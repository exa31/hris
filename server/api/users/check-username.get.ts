import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const query = getQuery(event)
    const username = (query.username as string) || ''
    const excludeId = query.excludeId ? Number(query.excludeId) : undefined

    return withTransaction(async (client) => {
        const isAvailable = await userService.checkUsername(client, username, excludeId)
        return sendSuccess(event, { isAvailable })
    })
})
