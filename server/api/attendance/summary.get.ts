import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as attendanceService from '~~/server/services/attendance.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    const query = getQuery(event)
    const month = Number(query.month) || new Date().getMonth() + 1
    const year = Number(query.year) || new Date().getFullYear()

    return withTransaction(async (client) => {
        const summary = await attendanceService.getAttendanceSummary(client, month, year)
        const todayStats = await attendanceService.getTodayStats(client)
        return sendSuccess(event, { summary, todayStats, month, year })
    })
}, [{ module: 'attendance', action: 'read' }])
