import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as attendanceService from '~~/server/services/attendance.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

import { HttpError } from '~~/server/errors/HttpError'
import { createAttendanceSchema } from '~~/server/model/attendance.model'
import z from 'zod'

export default withPermission(async (event) => {
    const body = await readBody(event)
    const validation = createAttendanceSchema.safeParse(body)

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data absensi tidak valid',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const data = await attendanceService.createAttendance(client, validation.data)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'CREATE',
            module: 'ATTENDANCE',
            description: `Menambahkan data absensi untuk employee_id: ${data.employee_id} tanggal ${data.date}`,
            metadata: { attendance_id: data.id }
        })

        return sendSuccess(event, data, 'Data absensi berhasil ditambahkan', 'SUCCESS', 201)
    })
}, [{ module: 'attendance', action: 'create' }])
