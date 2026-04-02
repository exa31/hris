import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const body = await readBody(event)

    return withTransaction(async (client) => {
        const data = await employeeService.bulkDeleteEmployees(client, body.ids)
        return sendSuccess(event, data, 'Pegawai berhasil dihapus secara massal')
    })
})
