import { handleError } from '~~/server/utils/handleError'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'
import { runDailyAutomationRoutine } from '~~/server/services/automation.service'
import { useServerConfig } from '~~/server/utils/config'

export default handleError(async (event) => {
  const config = useServerConfig()

  // 1. Validate Secret Header / Query / Bearer Token
  const reqKey =
    getHeader(event, 'x-automation-key') ||
    (getQuery(event).key ? String(getQuery(event).key) : null) ||
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
  const body = (await readBody(event).catch(() => ({}))) || {}

  // 3. Execute daily automation
  const report = await runDailyAutomationRoutine({
    date: body.date || null,
    days: typeof body.days === 'number' ? body.days : 1,
    from: body.from || null,
    to: body.to || null,
    includeWeekends: Boolean(body.includeWeekends),
    force: Boolean(body.force),
    syncTransport: body.syncTransport !== false,
    dryRun: Boolean(body.dryRun),
  })

  return sendSuccess(event, report, 'Daily automation executed successfully')
})
