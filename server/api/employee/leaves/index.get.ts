import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const userId = event.context.user.id;
        const userRes = await client.query('SELECT employee_id FROM users WHERE id = $1', [userId]);
        const employeeId = userRes.rows[0]?.employee_id;
        
        if (!employeeId) return sendSuccess(event, { leaves: [] });
        
        const leavesRes = await client.query(`
            SELECT id, type, start_date, end_date, reason, status, created_at 
            FROM leave_requests 
            WHERE employee_id = $1 
            ORDER BY created_at DESC
        `, [employeeId]);
        
        return sendSuccess(event, { leaves: leavesRes.rows });
    })
}, [])
