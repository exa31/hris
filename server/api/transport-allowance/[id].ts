import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as transportAllowanceService from '~~/server/services/transport-allowance.service'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
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
                const data = await transportAllowanceService.deleteTransportAllowance(client, id)
                
                // Log Activity
                await logActivity(client, {
                    user_id: event.context.user.id,
                    action: 'DELETE',
                    module: 'TRANSPORT_ALLOWANCE',
                    description: `Menghapus catatan tunjangan transport ID: ${id}`,
                    metadata: { allowance_id: id }
                })

                return data
            })
        }
    } catch (e: any) {
        console.error('API [id] Error:', e)
        throw e
    }
}, [{ module: 'transport', action: 'read' }])
