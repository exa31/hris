import { withPermission } from '~~/server/utils/withPermission';
import { withTransaction } from '~~/server/db/postgres';
import { sendSuccess } from '~~/server/utils/response';

export default withPermission(async (event) => {
  return withTransaction(async (client) => {
    const userId = event.context.user.id;

    const userRes = await client.query('SELECT employee_id FROM users WHERE id = $1', [userId]);
    const employeeId = userRes.rows[0]?.employee_id;

    if (!employeeId) return sendSuccess(event, { attendances: [] });

    const attRes = await client.query(
      `
            SELECT id, date, clock_in, clock_out, status 
            FROM attendances
            WHERE employee_id = $1 
            ORDER BY date DESC 
            LIMIT 30
        `,
      [employeeId],
    );

    return sendSuccess(event, { attendances: attRes.rows });
  });
}, []);
