import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const userId = event.context.user.id;
        
        // Get employee id
        const userRes = await client.query('SELECT employee_id FROM users WHERE id = $1', [userId]);
        const employeeId = userRes.rows[0]?.employee_id;
        
        if (!employeeId) {
            return sendSuccess(event, { attendancePercentage: 100, leavesRemaining: 12, pendingLeaves: 0 });
        }
        
        // Attendance this month
        const attRes = await client.query(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status IN ('Hadir', 'Terlambat') THEN 1 ELSE 0 END) as present
            FROM attendance
            WHERE employee_id = $1
              AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `, [employeeId]);
        const total = Number(attRes.rows[0]?.total || 0);
        const present = Number(attRes.rows[0]?.present || 0);
        const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 100;
        
        // Leaves
        const leavesRes = await client.query(`
            SELECT status FROM leave_requests WHERE employee_id = $1 AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `, [employeeId]);
        
        const pendingLeaves = leavesRes.rows.filter(r => r.status === 'Pending').length;
        const approvedLeaves = leavesRes.rows.filter(r => r.status === 'Approved').length;
        const leavesRemaining = Math.max(0, 12 - approvedLeaves);
        
        return sendSuccess(event, {
            attendancePercentage,
            leavesRemaining,
            pendingLeaves
        });
    })
}, [])
