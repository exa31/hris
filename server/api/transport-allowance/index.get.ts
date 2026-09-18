/**
 * Transport Allowance List (READ ONLY)
 * GET /api/transport-allowance
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as transportService from '~~/server/services/transport-allowance.service'
import { sendSuccess } from '~~/server/utils/response'
import { searchTransportAllowanceSchema } from '~~/server/model/transport-allowance.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
        searchTransportAllowanceSchema.safeParse(query)
    )

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Satu atau lebih parameter query tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await transportService.getTransportAllowances(client, parsed.data)
        return sendSuccess(event, data)
    })
}, [{ module: 'transport', action: 'read' }])
