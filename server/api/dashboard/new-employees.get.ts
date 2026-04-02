import { handleError } from '~~/server/utils/handleError';
import { withAuth } from '~~/server/utils/withAuth';
import type { Employee } from '~~/app/types/models';

interface NewEmployeeResponse extends Employee {
    employee_name: string;
}

export default withAuth(async (event) => {

    // Get 5 newest contract employees
    const result = await pool.query<NewEmployeeResponse>(
        `SELECT e.*, e.name as employee_name 
             FROM employees e
             WHERE e.employment_type = $1 AND e.status = true
             ORDER BY e.join_date DESC
             LIMIT 5`,
        ['Kontrak']
    );

    return result.rows;
});
