import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import { logActivity } from '~~/server/services/activity-log.service'

export default withAuth(async (event) => {
    const body = await readBody(event)

    return withTransaction(async (client) => {
        return logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: body.module || 'SYSTEM',
            description: body.description || 'Mengakses module',
            metadata: { 
                url: body.url,
                user_agent: getHeader(event, 'user-agent')
            }
        })
    })
})
