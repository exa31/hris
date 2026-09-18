import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as holidayService from '~~/server/services/holiday.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { holidaySchema } from '~~/server/model/holiday.model'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
  const parsed = await readValidatedBody(event, (body) => holidaySchema.safeParse(body))

  if (!parsed.success) {
    throw new HttpError(400, 'INVALID_REQUEST', 'Invalid holiday data', z.treeifyError(parsed.error).properties)
  }

  return withTransaction(async (client) => {
    const holiday = await holidayService.createHoliday(client, parsed.data)

    await logActivity(client, {
      user_id: event.context.user.id,
      action: 'CREATE',
      module: 'HOLIDAY',
      description: `Created new holiday: ${holiday.name} (${holiday.date})`,
      metadata: { holiday_id: holiday.id, date: holiday.date }
    })

    return sendSuccess(event, holiday, 'Holiday created successfully')
  })
}, [{ module: 'attendance', action: 'create' }])
