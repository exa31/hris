import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    return withTransaction(async (client) => {
        const data = await userService.getRoles(client)
        return sendSuccess(event, data)
    })
})
