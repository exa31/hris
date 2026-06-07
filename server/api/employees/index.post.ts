import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'
import { createEmployeeSchema } from '~~/server/model/employee.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await readValidatedBody(event, (body) => createEmployeeSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(parsed.error).properties)
    }

    return withTransaction(async (client) => {
        const data = await employeeService.createEmployee(client, parsed.data)
        
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
}, [{ module: 'employees', action: 'create' }])
