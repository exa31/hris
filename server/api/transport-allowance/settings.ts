import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as transportAllowanceService from '~~/server/services/transport-allowance.service'

export default withAuth(async (event) => {
    const method = event.method

    if (method === 'GET') {
        return withTransaction(async (client) => {
            return transportAllowanceService.getTransportSettings(client)
        })
    }

    if (method === 'POST' || method === 'PUT') {
        const body = await readBody(event)
        return withTransaction(async (client) => {
            return transportAllowanceService.updateTransportSettings(client, body.base_fare_per_km)
        })
    }
})
