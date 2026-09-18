import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as holidayService from '~~/server/services/holiday.service'
import { sendSuccess } from '~~/server/utils/response'
import { searchHolidaySchema } from '~~/server/model/holiday.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
  const parsed = await getValidatedQuery(event, (query) => searchHolidaySchema.safeParse(query))

  if (!parsed.success) {
    throw new HttpError(
      400,
      'INVALID_QUERY',
      'Parameter query hari libur tidak valid',
      z.treeifyError(parsed.error).properties
    )
  }

  return withTransaction(async (client) => {
    const holidays = await holidayService.getHolidays(client, parsed.data)
    return sendSuccess(event, holidays)
  })
}, [])
