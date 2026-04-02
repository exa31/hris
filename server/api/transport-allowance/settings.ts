import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import { handleError } from '~~/server/utils/handleError'
import * as transportAllowanceService from '~~/server/services/transport-allowance.service'

export default withAuth(handleError(async (event) => {
    const method = event.method

    if (method === 'GET') {
        return withTransaction(async (client) => {
            const settings = await transportAllowanceService.getTransportSettings(client)
            return settings
        })
    }

    if (method === 'POST' || method === 'PUT') {
        const body = await readBody(event)
        return withTransaction(async (client) => {
            const settings = await transportAllowanceService.updateTransportSettings(client, body)
            return settings
        })
    }
}))
