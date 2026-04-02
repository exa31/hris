import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as transportAllowanceService from '~~/server/services/transport-allowance.service'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
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
            const data = await transportAllowanceService.createTransportAllowance(client, body)
            
            // Log Activity
            await logActivity(client, {
                user_id: event.context.user.id,
                action: 'CREATE',
                module: 'TRANSPORT_ALLOWANCE',
                description: `Mencatat tunjangan transport untuk Pegawai ID: ${data.employee_id} (Periode: ${data.month}/${data.year})`,
                metadata: { allowance_id: data.id }
            })

            return data
        })
    }
}, [{ module: 'transport', action: 'read' }])
