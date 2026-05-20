import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as attendanceService from '~~/server/services/attendance.service'
import { sendSuccess } from '~~/server/utils/response'
import { logActivity } from '~~/server/services/activity-log.service'

export default withPermission(async (event) => {
    const id = Number(getRouterParam(event, 'id'))

    return withTransaction(async (client) => {
        const data = await attendanceService.deleteAttendance(client, id)

        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'DELETE',
            module: 'ATTENDANCE',
            description: `Menghapus data absensi ID: ${id}`,
            metadata: { attendance_id: id }
        })

        return sendSuccess(event, data, 'Data absensi berhasil dihapus')
    })
}, [{ module: 'attendance', action: 'delete' }])
