import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as holidayService from '~~/server/services/holiday.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'

export default withPermission(async (event) => {
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || isNaN(id)) {
    throw new HttpError(400, 'INVALID_ID', 'Invalid holiday ID')
  }

  return withTransaction(async (client) => {
    const existing = await holidayService.getHolidayById(client, id)
    await holidayService.deleteHoliday(client, id)

    await logActivity(client, {
      user_id: event.context.user.id,
      action: 'DELETE',
      module: 'HOLIDAY',
      description: `Deleted holiday: ${existing.name} (${existing.date})`,
      metadata: { holiday_id: id, name: existing.name, date: existing.date }
    })

    return sendSuccess(event, null, 'Holiday deleted successfully')
  })
}, [{ module: 'attendance', action: 'delete' }])
