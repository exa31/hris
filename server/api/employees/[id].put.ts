import { HttpError } from '~~/server/errors/HttpError'
import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'Invalid employee ID')
    }

    const body = await readBody(event) || {}
    body.id = id // inject the URL id to satisfy the schema validation

    return withTransaction(async (client) => {
        const data = await employeeService.updateEmployee(client, id, body)
        return sendSuccess(event, data, 'Data pegawai berhasil diperbarui')
    })
})
