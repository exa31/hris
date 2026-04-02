import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const body = await readBody(event)

    return withTransaction(async (client) => {
        const data = await employeeService.createEmployee(client, body)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'CREATE',
            module: 'EMPLOYEE_MANAGEMENT',
            description: `Menambahkan pegawai baru: ${data.name} (NIP: ${data.nip})`,
            metadata: { employee_id: data.id }
        })

        return sendSuccess(event, data, 'Pegawai berhasil dibuat', 'SUCCESS', 201)
    })
})
