import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'
import { searchDeletedEmployeesSchema } from '~~/server/model/employee.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
        searchDeletedEmployeesSchema.safeParse(query)
    )

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Parameter query tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const result = await employeeService.getDeletedEmployees(client, parsed.data)
        return sendSuccess(event, result)
    })
}, [{ module: 'employees', action: 'manage' }])
