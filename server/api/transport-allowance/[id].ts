import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as transportAllowanceService from '~~/server/services/transport-allowance.service'

export default withAuth(async (event) => {
    try {
        const id = parseInt(event.context.params?.id as string)
        const method = event.method

        if (method === 'GET') {
            return withTransaction(async (client) => {
                return transportAllowanceService.getTransportAllowanceById(client, id)
            })
        }

        if (method === 'DELETE') {
            return withTransaction(async (client) => {
                return transportAllowanceService.deleteTransportAllowance(client, id)
            })
        }
    } catch (e: any) {
        console.error('API [id] Error:', e)
        throw e
    }
})
