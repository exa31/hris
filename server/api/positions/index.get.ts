/**
 * Get all positions
 * GET /api/positions
 */

import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as positionRepository from '~~/server/repositories/position.repository'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const positions = await positionRepository.getPositions(client)
        return sendSuccess(event, positions)
    })
}, [{ module: 'employees', action: 'read' }])
