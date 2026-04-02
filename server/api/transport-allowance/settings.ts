import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import { handleError } from '~~/server/utils/handleError'
import * as transportAllowanceService from '~~/server/services/transport-allowance.service'
import { logActivity } from '~~/server/services/activity-log.service'

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
            
            // Log Activity
            await logActivity(client, {
                user_id: event.context.user.id,
                action: 'UPDATE',
                module: 'TRANSPORT_ALLOWANCE',
                description: `Memperbarui pengaturan tunjangan transport (Tarif KM: ${settings.tariffPerKm})`,
                metadata: { settings_id: settings.id }
            })

            return settings
        })
    }
}))
