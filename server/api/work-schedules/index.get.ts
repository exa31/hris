import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as workScheduleService from '~~/server/services/work-schedule.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
  return withTransaction(async (client) => {
    const schedules = await workScheduleService.getWorkSchedules(client)
    return sendSuccess(event, schedules)
  })
}, [])
