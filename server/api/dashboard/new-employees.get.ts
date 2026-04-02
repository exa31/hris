import { withPermission } from '~~/server/utils/withPermission';
import { withTransaction } from '~~/server/db/postgres';
import * as employeeService from '~~/server/services/employee.service';
import { logActivity } from '~~/server/services/activity-log.service';
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
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
}, [{ module: 'dashboard', action: 'read' }]);
