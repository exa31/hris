/**
 * List Deleted Users
 * GET /api/recovery/users
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    const query = getQuery(event)
    
    return withTransaction(async (client) => {
        const result = await userService.getDeletedUsers(client, query)
        return sendSuccess(event, result)
    })
}, [{ module: 'users', action: 'manage' }])
