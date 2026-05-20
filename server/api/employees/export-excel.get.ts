import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as employeeService from "~~/server/services/employee.service";
import ExcelJS from "exceljs";
import { logActivity } from "~~/server/services/activity-log.service";

export default withPermission(
  async (event) => {
    const query = getQuery(event);
    const params: any = {
      search: (query.search as string) || undefined,
      department_id: query.department_id ? Number(query.department_id) : undefined,
      status: query.status !== undefined ? query.status === 'true' : undefined,
      type: query.type !== undefined ? String(query.type) : undefined,
      position_ids: query.positions
        ? (query.positions as string).split(",").map(Number)
        : undefined,
      tenureOperator: (query.tenureOperator as ">" | "<" | "=") || undefined,
      tenureValue: query.tenureValue ? Number(query.tenureValue) : undefined,
      sortColumn: (query.sortColumn as string) || "name",
      sortDirection: (query.sortDirection as "asc" | "desc") || "asc",
    };

    return withTransaction(async (client) => {
      const { employees } = await employeeService.getEmployees(client, params);

      // Log Activity
      await logActivity(client, {
        user_id: event.context.user.id,
        action: "ACCESS",
        module: "EMPLOYEE_MANAGEMENT",
        description: `Ekspor data pegawai ke Excel (${employees.length} data)`,
      });

      const workbook = new ExcelJS.Workbook();
      // ... (rest of Excel generation)
      const worksheet = workbook.addWorksheet("Data Pegawai");

      // Define columns
      worksheet.columns = [
        { header: "NIP", key: "nip", width: 15 },
        { header: "Nama", key: "name", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Jabatan", key: "position", width: 15 },
        { header: "Departemen", key: "department", width: 15 },
        { header: "Tanggal Masuk", key: "join_date", width: 15 },
        { header: "Status", key: "status", width: 10 },
      ];

      // Add rows
      employees.forEach((emp: any) => {
        worksheet.addRow({
          nip: emp.nip,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          position: emp.position_name || emp.position,
          department: emp.department_name || emp.department,
          join_date: new Date(emp.join_date).toLocaleDateString("id-ID"),
          status: emp.status ? "Aktif" : "Nonaktif",
        });
      });

      // Styling
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      const buffer = await workbook.xlsx.writeBuffer();

      appendHeader(
        event,
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      appendHeader(
        event,
        "Content-Disposition",
        'attachment; filename="data-pegawai.xlsx"',
      );

      return buffer;
    });
  },
  [{ module: "employees", action: "read" }],
);
