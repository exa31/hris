import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { employeeSearchQuerySchema } from '~~/server/model/user.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await getValidatedQuery(event, (query) => employeeSearchQuerySchema.safeParse(query))

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Parameter pencarian tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    const { search } = parsed.data

    return withTransaction(async (client) => {
        const data = await userService.searchEmployeesWithoutAccount(client, search)
        return sendSuccess(event, data)
    })
}, [{ module: 'users', action: 'read' }])
