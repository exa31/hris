/**
 * Transport Settings - UPDATE
 * PUT /api/transport-allowance/settings
 * Body: { base_fare: number, is_active: boolean }
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as transportService from '~~/server/services/transport-allowance.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    const body = await readBody(event)

    return withTransaction(async (client) => {
        const settings = await transportService.updateTransportSettings(client, {
            base_fare: body.base_fare,
            is_active: body.is_active,
        })

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'UPDATE',
            module: 'TRANSPORT_SETTING',
            description: `Memperbarui pengaturan tunjangan transport (Base Fare: ${settings.base_fare}, Aktif: ${settings.is_active})`,
            metadata: { settings_id: settings.id }
        })

        return sendSuccess(event, settings, 'Pengaturan tunjangan berhasil disimpan')
    })
}, [{ module: 'transport_setting', action: 'update' }])
