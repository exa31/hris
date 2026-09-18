import { handleError } from '~~/server/utils/handleError'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import { runDailyAutomationRoutine } from '~~/server/services/automation.service'
import { useServerConfig } from '~~/server/utils/config'
import z from 'zod'

const automationQuerySchema = z.object({
  key: z.string().optional(),
})

const dailyAutomationBodySchema = z.object({
  date: z.string().optional().nullable(),
  days: z.coerce.number().int().positive().default(1),
  from: z.string().optional().nullable(),
  to: z.string().optional().nullable(),
  includeWeekends: z.boolean().default(false),
  force: z.boolean().default(false),
  syncTransport: z.boolean().default(true),
  dryRun: z.boolean().default(false),
})

export default handleError(async (event) => {
  const config = useServerConfig()

  // 1. Validate Secret Header / Query / Bearer Token
  const queryParsed = await getValidatedQuery(event, (q) => automationQuerySchema.safeParse(q)).catch(() => null)
  const queryKey = queryParsed?.success ? queryParsed.data.key : undefined

  const reqKey =
    getHeader(event, 'x-automation-key') ||
    queryKey ||
    getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')

  const validSecrets = [
    (config as any).automationSecret,
    config.jwtSecret,
    process.env.AUTOMATION_SECRET,
    process.env.NUXT_AUTOMATION_SECRET,
    'nexus-hris-automation-secret-2026',
  ].filter(Boolean)

  if (!reqKey || !validSecrets.includes(reqKey)) {
    throw new HttpError(
      401,
      'UNAUTHORIZED',
      'Akses ditolak: Automation key tidak valid atau tidak disertakan di header x-automation-key'
    )
  }

  // 2. Parse request body
  const bodyParsed = await readValidatedBody(event, (b) => dailyAutomationBodySchema.safeParse(b || {})).catch(() => null)
  const body = bodyParsed?.success ? bodyParsed.data : dailyAutomationBodySchema.parse({})

  // 3. Execute daily automation
  const report = await runDailyAutomationRoutine({
    date: body.date || null,
    days: body.days,
    from: body.from || null,
    to: body.to || null,
    includeWeekends: body.includeWeekends,
    force: body.force,
    syncTransport: body.syncTransport,
    dryRun: body.dryRun,
  })

  return sendSuccess(event, report, 'Daily automation executed successfully')
})
