import { withAuth } from '~~/server/utils/withAuth';
import { withTransaction } from '~~/server/db/postgres';
import * as employeeService from '~~/server/services/employee.service';
import { sendSuccess } from '~~/server/utils/response'

export default withAuth(async (event) => {
    return withTransaction(async (client) => {
        const data = await employeeService.getNewContractEmployees(client);
        return sendSuccess(event, data)
    });
});
