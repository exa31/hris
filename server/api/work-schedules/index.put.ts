import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as workScheduleService from '~~/server/services/work-schedule.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { updateWorkSchedulesSchema } from '~~/server/model/work-schedule.model'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
  const parsed = await readValidatedBody(event, (body) => updateWorkSchedulesSchema.safeParse(body))

  if (!parsed.success) {
    throw new HttpError(400, 'INVALID_REQUEST', 'Invalid work schedule data', z.treeifyError(parsed.error).properties)
  }

  return withTransaction(async (client) => {
    const updated = await workScheduleService.updateWorkSchedules(client, parsed.data.schedules)

    await logActivity(client, {
      user_id: event.context.user.id,
      action: 'UPDATE',
      module: 'WORK_SCHEDULE',
      description: `Updated company work schedule and working hours (${updated.length} days)`,
      metadata: { schedules_count: updated.length }
    })

    return sendSuccess(event, updated, 'Work schedule updated successfully')
  })
}, [{ module: 'attendance', action: 'update' }])
