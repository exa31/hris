import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const data = await userService.getPermissions(client)
        return sendSuccess(event, data)
    })
}, [{ module: 'roles', action: 'read' }])
