import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const query = getQuery(event)
    const search = (query.search as string) || ''

    return withTransaction(async (client) => {
        const data = await userService.searchEmployeesWithoutAccount(client, search)
        return sendSuccess(event, data)
    })
})
