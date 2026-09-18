import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as attendanceService from '~~/server/services/attendance.service'
import { sendSuccess } from '~~/server/utils/response'
import { attendanceSummarySchema } from '~~/server/model/attendance.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await getValidatedQuery(event, (query) => attendanceSummarySchema.safeParse(query))

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Parameter query tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    const { month, year } = parsed.data

    return withTransaction(async (client) => {
        const summary = await attendanceService.getAttendanceSummary(client, month, year)
        const todayStats = await attendanceService.getTodayStats(client)
        return sendSuccess(event, { summary, todayStats, month, year })
    })
}, [{ module: 'attendance', action: 'read' }])
