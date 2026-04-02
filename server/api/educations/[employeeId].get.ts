import { HttpError } from '~~/server/errors/HttpError'
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as educationService from '~~/server/services/education.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'Invalid employee ID')
    }

    return withTransaction(async (client) => {
        const educations = await educationService.getEmployeeEducations(client, id)
        return sendSuccess(event, educations)
    })
}, [{ module: 'employees', action: 'read' }])

