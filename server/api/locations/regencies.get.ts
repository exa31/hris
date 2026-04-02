import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as locationService from '~~/server/services/location.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const query = getQuery(event)
    const keyword = query.q as string

    return withTransaction(async (client) => {
        const data = await locationService.searchRegencies(client, keyword)
        return sendSuccess(event, data)
    })
})
