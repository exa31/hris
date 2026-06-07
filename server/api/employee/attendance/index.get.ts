import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import * as attendanceService from '~~/server/services/attendance.service'

export default withPermission(async (event) => {
  return withTransaction(async (client) => {
    const userId = event.context.user.id
    const data = await attendanceService.getEmployeeAttendanceHistory(client, userId)
    return sendSuccess(event, data)
  })
}, [])
