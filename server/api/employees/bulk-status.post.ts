import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const body = await readBody(event)

    return withTransaction(async (client) => {
        const data = await employeeService.bulkUpdateStatus(client, body.ids, body.status)
        return sendSuccess(event, data, 'Status pegawai berhasil diperbarui secara massal')
    })
})
