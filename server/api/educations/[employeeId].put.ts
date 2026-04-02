import { HttpError } from '~~/server/errors/HttpError'
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as educationService from '~~/server/services/education.service'
import { sendSuccess } from '~~/server/utils/response'
import z from 'zod'

const syncEducationsSchema = z.object({
    educationIds: z.array(z.number().positive()).default([]),
})

export default withPermission(async (event) => {
    const employeeId = parseInt(getRouterParam(event, 'employeeId') || '0')

    if (!employeeId) {
        throw new HttpError(400, 'INVALID_ID', 'Invalid employee ID')
    }

    const body = await readBody(event)
    const validation = syncEducationsSchema.safeParse(body)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Invalid request body',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await educationService.syncEmployeeEducations(client, employeeId, validation.data.educationIds)
        return sendSuccess(event, data, 'Pendidikan berhasil disinkronkan')
    })
}, [{ module: 'employees', action: 'update' }])

