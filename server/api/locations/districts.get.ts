import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as locationService from '~~/server/services/location.service'
import { sendSuccess } from '~~/server/utils/response'
import { searchDistrictQuerySchema } from '~~/server/model/district.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withAuth(async (event) => {
    const parsed = await getValidatedQuery(event, (query) => searchDistrictQuerySchema.safeParse(query))

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Parameter query tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await locationService.searchDistricts(client, parsed.data.q)
        return sendSuccess(event, data)
    })
})
