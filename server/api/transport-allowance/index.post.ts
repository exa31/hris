import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as transportAllowanceService from '~~/server/services/transport-allowance.service'
import { logActivity } from '~~/server/services/activity-log.service'
import { createTransportAllowanceSchema } from '~~/server/model/transport-allowance.model'
import { HttpError } from '~~/server/errors/HttpError'
import { sendSuccess } from '~~/server/utils/response'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await readValidatedBody(event, (body) => createTransportAllowanceSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(
            400,
            'VALIDATION_ERROR',
            'Data tunjangan transport tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await transportAllowanceService.createTransportAllowance(client, parsed.data)

        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'CREATE',
            module: 'TRANSPORT_ALLOWANCE',
            description: `Mencatat tunjangan transport untuk Pegawai ID: ${data.employee_id} (Periode: ${data.month}/${data.year})`,
            metadata: { allowance_id: data.id }
        })

        return sendSuccess(event, data, 'Berhasil mencatat tunjangan transport', 'CREATED', 201)
    })
}, [{ module: 'transport', action: 'manage' }])
