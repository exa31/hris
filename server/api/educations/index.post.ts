import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as educationService from '~~/server/services/education.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    const body = await readBody(event)

    return withTransaction(async (client) => {
        const education = await educationService.createEducation(client, body)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'CREATE',
            module: 'EMPLOYEE_MANAGEMENT',
            description: `Menambahkan data pendidikan baru: ${education.name}`,
            metadata: { education_id: education.id }
        })

        return sendSuccess(event, education, 'Pendidikan berhasil dibuat', 'SUCCESS', 201)
    })
}, [{ module: 'employees', action: 'create' }])
