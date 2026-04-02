import { withAuth } from '~~/server/utils/withAuth';
import { withTransaction } from '~~/server/db/postgres';
import * as employeeService from '~~/server/services/employee.service';
import { logActivity } from '~~/server/services/activity-log.service';
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    return withTransaction(async (client) => {
        const data = await employeeService.getNewContractEmployees(client);
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: 'DASHBOARD',
            description: 'Melihat data pegawai baru di dashboard'
        })

        return sendSuccess(event, data)
    });
});
