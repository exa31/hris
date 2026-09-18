import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import * as attendanceService from '~~/server/services/attendance.service'
import { searchEmployeeAttendanceSchema } from '~~/server/model/attendance.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
  const parsed = await getValidatedQuery(event, (query) =>
    searchEmployeeAttendanceSchema.safeParse(query)
  )

  if (!parsed.success) {
    throw new HttpError(
      400,
      'INVALID_QUERY',
      'Satu atau lebih parameter query tidak valid',
      z.treeifyError(parsed.error).properties
    )
  }

  return withTransaction(async (client) => {
    const userId = event.context.user.id
    const data = await attendanceService.getEmployeeAttendanceHistory(client, userId, parsed.data)
    return sendSuccess(event, data)
  })
}, [])
