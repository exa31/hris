import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as transportAllowanceService from '~~/server/services/transport-allowance.service'

export default withAuth(async (event) => {
    const method = event.method
    const query = getQuery(event)

    if (method === 'GET') {
        const options = {
            month: query.month ? parseInt(query.month as string) : undefined,
            year: query.year ? parseInt(query.year as string) : undefined,
            search: query.search as string,
            limit: query.limit ? parseInt(query.limit as string) : 10,
            offset: query.offset ? parseInt(query.offset as string) : 0
        }

        return withTransaction(async (client) => {
            return transportAllowanceService.getTransportAllowances(client, options)
        })
    }

    if (method === 'POST') {
        const body = await readBody(event)
        return withTransaction(async (client) => {
            return transportAllowanceService.createTransportAllowance(client, body)
        })
    }
})
