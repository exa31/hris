import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as departmentService from '~~/server/services/department.service'
import { sendSuccess } from '~~/server/utils/response'

export default withPermission(async (event) => {
    return withTransaction(async (client) => {
        const departments = await departmentService.getDepartments(client)
        return sendSuccess(event, departments)
    })
}, [{ module: 'employees', action: 'read' }])
