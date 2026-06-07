import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as positionService from '~~/server/services/position.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const positions = await positionService.getPositions(client)
        return sendSuccess(event, positions)
    })
}, [{ module: 'employees', action: 'read' }])
