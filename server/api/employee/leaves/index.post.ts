import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'

export default withPermission(async (event) => {
    const body = await readBody(event);
    const { type, start_date, end_date, reason } = body;

    return withTransaction(async (client) => {
        const userId = event.context.user.id;
        const userRes = await client.query('SELECT employee_id FROM users WHERE id = $1', [userId]);
        const employeeId = userRes.rows[0]?.employee_id;
        
        if (!employeeId) throw new HttpError(400, 'NO_EMPLOYEE', 'User ini bukan pegawai.');
        
        await client.query(`
            INSERT INTO leave_requests (employee_id, type, start_date, end_date, reason, status)
            VALUES ($1, $2, $3, $4, $5, 'Pending')
        `, [employeeId, type, start_date, end_date, reason]);
        
        return sendSuccess(event, { message: 'Pengajuan cuti berhasil' });
    })
}, [])
