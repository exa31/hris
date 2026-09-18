import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as holidayService from '~~/server/services/holiday.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { holidaySchema } from '~~/server/model/holiday.model'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || isNaN(id)) {
    throw new HttpError(400, 'INVALID_ID', 'Invalid holiday ID')
  }

  const parsed = await readValidatedBody(event, (body) => holidaySchema.partial().safeParse(body))

  if (!parsed.success) {
    throw new HttpError(400, 'INVALID_REQUEST', 'Invalid holiday data', z.treeifyError(parsed.error).properties)
  }

  return withTransaction(async (client) => {
    const holiday = await holidayService.updateHoliday(client, id, parsed.data)

    await logActivity(client, {
      user_id: event.context.user.id,
      action: 'UPDATE',
      module: 'HOLIDAY',
      description: `Updated holiday: ${holiday.name} (${holiday.date})`,
      metadata: { holiday_id: holiday.id, date: holiday.date }
    })

    return sendSuccess(event, holiday, 'Holiday updated successfully')
  })
}, [{ module: 'attendance', action: 'update' }])
