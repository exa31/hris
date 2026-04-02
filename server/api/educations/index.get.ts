/**
 * Get All Educations
 * GET /api/educations
 */
import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as educationService from '~~/server/services/education.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    return withTransaction(async (client) => {
        const educations = await educationService.getEducations(client)
        return sendSuccess(event, educations)
    })
})
