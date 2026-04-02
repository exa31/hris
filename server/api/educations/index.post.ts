import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as educationService from '~~/server/services/education.service'
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    const body = await readBody(event)

    return withTransaction(async (client) => {
        const education = await educationService.createEducation(client, body)
        return sendSuccess(event, education, 'Pendidikan berhasil dibuat', 'SUCCESS', 201)
    })
})
