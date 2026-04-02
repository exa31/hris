/**
 * Get All Educations
 * GET /api/educations
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as educationService from '~~/server/services/education.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const educations = await educationService.getEducations(client)
        return sendSuccess(event, educations)
    })
}, [{ module: 'employees', action: 'read' }])
