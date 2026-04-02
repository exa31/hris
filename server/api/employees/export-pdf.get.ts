import { withAuth } from '~~/server/utils/withAuth'
import { withTransaction } from '~~/server/db/postgres'
import * as employeeService from '~~/server/services/employee.service'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default withAuth(async (event) => {
    const query = getQuery(event)
    const params: any = {
        search: (query.search as string) || undefined,
        positions: query.positions ? (query.positions as string).split(',') : undefined,
        tenureOperator: (query.tenureOperator as any) || undefined,
        tenureValue: query.tenureValue ? Number(query.tenureValue) : undefined,
        sortColumn: (query.sortColumn as string) || 'name',
        sortDirection: (query.sortDirection as 'asc' | 'desc') || 'asc',
        limit: 1000, // Export all (up to 1k)
        offset: 0
    }

    return withTransaction(async (client) => {
        const { employees } = await employeeService.getEmployees(client, params)

        const doc = new jsPDF()

        doc.setFontSize(18)
        doc.text('Laporan Data Pegawai', 14, 22)
        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, 14, 30)

        autoTable(doc, {
            startY: 40,
            head: [['NIP', 'Nama', 'Jabatan', 'Departemen', 'Tgl Masuk', 'Status']],
            body: employees.map(emp => [
                emp.nip,
                emp.name,
                emp.position,
                emp.department,
                new Date(emp.join_date).toLocaleDateString('id-ID'),
                emp.status ? 'Aktif' : 'Nonaktif'
            ]),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            margin: { top: 40 }
        })

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

        appendHeader(event, 'Content-Type', 'application/pdf')
        appendHeader(event, 'Content-Disposition', 'attachment; filename="data-pegawai.pdf"')

        return pdfBuffer
    })
})
