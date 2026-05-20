/**
 * Create new position
 * POST /api/positions
 */

import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as positionRepository from '~~/server/repositories/position.repository'
import { createPositionSchema } from '~~/server/model/position.model'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'

export default withPermission(async (event) => {
    const body = await readBody(event)
    const validation = createPositionSchema.safeParse(body)

    if (!validation.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Nama jabatan wajib diisi')
    }

    return withTransaction(async (client) => {
        const position = await positionRepository.createPosition(client, validation.data)
        return sendSuccess(event, position, 'Jabatan berhasil ditambahkan')
    })
}, [{ module: 'employees', action: 'create' }])
