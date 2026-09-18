import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { logActivity } from '~~/server/services/activity-log.service'
import { exportEmployeesSchema } from '~~/server/model/employee.model'
import { HttpError } from '~~/server/errors/HttpError'
import z from 'zod'

export default withPermission(async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
        exportEmployeesSchema.safeParse(query)
    )

    if (!parsed.success) {
        throw new HttpError(
            400,
            'INVALID_QUERY',
            'Parameter query ekspor tidak valid',
            z.treeifyError(parsed.error).properties
        )
    }

    return withTransaction(async (client) => {
        const { employees } = await employeeService.getEmployees(client, parsed.data)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'ACCESS',
            module: 'EMPLOYEE_MANAGEMENT',
            description: `Exported employee directory to PDF (${employees.length} records)`
        })

        const doc = new jsPDF()

        doc.setFontSize(18)
        doc.text('Employee Directory Report', 14, 22)
        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} ${new Date().toLocaleTimeString('en-US')}`, 14, 30)

        autoTable(doc, {
            startY: 40,
            head: [['NIP', 'Full Name', 'Position', 'Department', 'Role', 'Join Date', 'Status']],
            body: employees.map(emp => [
                emp.nip,
                emp.name,
                emp.position_name || emp.position || '-',
                emp.department_name || emp.department || '-',
                emp.role_name || 'Pegawai',
                emp.join_date ? new Date(emp.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
                emp.status ? 'Active' : 'Inactive'
            ]),
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: 255 },
            margin: { top: 40 }
        })

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

        appendHeader(event, 'Content-Type', 'application/pdf')
        appendHeader(event, 'Content-Disposition', 'attachment; filename="employee-directory.pdf"')

        return pdfBuffer
    })
}, [{ module: 'employees', action: 'read' }])
