import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as activityLogService from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    const query = getQuery(event)
    const options = {
        limit: query.limit ? parseInt(query.limit as string) : 50,
        offset: query.offset ? parseInt(query.offset as string) : 0
    }
    
    return withTransaction(async (client) => {
        return activityLogService.getActivityLogs(client, options)
    })
}, [{ module: 'logs', action: 'read' }])
