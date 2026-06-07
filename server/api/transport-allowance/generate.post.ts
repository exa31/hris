/**
 * Generate Transport Allowances
 * POST /api/transport-allowance/generate
 * Body: { month: number, year: number, force?: boolean }
 */
import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as transportService from '~~/server/services/transport-allowance.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'
import { transportGenerateSchema } from '~~/server/model/transport-allowance.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await readValidatedBody(event, (body) => transportGenerateSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(parsed.error).properties)
    }

    const { month, year, force } = parsed.data

    return withTransaction(async (client) => {
        const result = await transportService.generateAllowances(client, month, year, force)

        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: force ? 'REGENERATE' : 'GENERATE',
            module: 'TRANSPORT_ALLOWANCE',
            description: `${force ? 'Regenerate' : 'Generate'} tunjangan transport periode ${month}/${year} (${result.total_inserted} pegawai)`,
            metadata: { ...result }
        })

        return sendSuccess(event, result, `Berhasil ${force ? 'regenerate' : 'generate'} ${result.total_inserted} data tunjangan transport`)
    })
}, [{ module: 'transport_setting', action: 'create' }])
