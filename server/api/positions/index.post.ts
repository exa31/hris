import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as positionService from '~~/server/services/position.service'
import { createPositionSchema } from '~~/server/model/position.model'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'

export default withPermission(async (event) => {
    const parsed = await readValidatedBody(event, (body) => createPositionSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Nama jabatan wajib diisi')
    }

    return withTransaction(async (client) => {
        const position = await positionService.createPosition(client, parsed.data)
        return sendSuccess(event, position, 'Jabatan berhasil ditambahkan')
    })
}, [{ module: 'employees', action: 'create' }])
