/**
 * Transport Settings - GET
 * GET /api/transport-allowance/settings
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as transportService from '~~/server/services/transport-allowance.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const settings = await transportService.getTransportSettings(client)
        return sendSuccess(event, settings)
    })
}, [{ module: 'transport_setting', action: 'read' }])
