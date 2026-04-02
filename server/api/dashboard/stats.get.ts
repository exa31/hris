import { handleError } from '~~/server/utils/handleError';
import { withAuth } from '~~/server/utils/withAuth';
import type { Employee } from '~~/app/types/models';

export default withAuth(async (event) => {
    try {

        // Get total employees
        const totalRes = await pool.query(
            'SELECT COUNT(*) as count FROM employees WHERE status = true'
        );
        const totalEmployees = parseInt(totalRes.rows[0].count);

        // Get employees by employment type
        const kontrakRes = await pool.query(
            'SELECT COUNT(*) as count FROM employees WHERE employment_type = $1 AND status = true',
            ['Kontrak']
        );
        const totalKontrak = parseInt(kontrakRes.rows[0].count);

        const tetapRes = await pool.query(
            'SELECT COUNT(*) as count FROM employees WHERE employment_type = $1 AND status = true',
            ['Tetap']
        );
        const totalTetap = parseInt(tetapRes.rows[0].count);

        const magangRes = await pool.query(
            'SELECT COUNT(*) as count FROM employees WHERE employment_type = $1 AND status = true',
            ['Magang']
        );
        const totalMagang = parseInt(magangRes.rows[0].count);

        // Get employees by gender
        const maleRes = await pool.query(
            'SELECT COUNT(*) as count FROM employees WHERE gender = $1 AND status = true',
            ['Male']
        );
        const totalMale = parseInt(maleRes.rows[0].count);

        const femaleRes = await pool.query(
            'SELECT COUNT(*) as count FROM employees WHERE gender = $1 AND status = true',
            ['Female']
        );
        const totalFemale = parseInt(femaleRes.rows[0].count);

        return {
            total: totalEmployees,
            kontrak: totalKontrak,
            tetap: totalTetap,
            magang: totalMagang,
            male: totalMale,
            female: totalFemale,
        };
    } catch (error) {
        return handleError(error, event);
    }
});
