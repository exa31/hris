/**
 * Transport Allowance List (READ ONLY)
 * GET /api/transport-allowance
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as transportService from '~~/server/services/transport-allowance.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    const query = getQuery(event)
    const options = {
        month: query.month ? parseInt(query.month as string) : undefined,
        year: query.year ? parseInt(query.year as string) : undefined,
        search: query.search as string,
        limit: query.limit ? parseInt(query.limit as string) : 10,
        offset: query.offset ? parseInt(query.offset as string) : 0,
    }

    return withTransaction(async (client) => {
        const data = await transportService.getTransportAllowances(client, options)
        return sendSuccess(event, data)
    })
}, [{ module: 'transport', action: 'read' }])
