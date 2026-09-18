import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as employeeService from "~~/server/services/employee.service";
import ExcelJS from "exceljs";
import { logActivity } from "~~/server/services/activity-log.service";
import { exportEmployeesSchema } from "~~/server/model/employee.model";
import { HttpError } from "~~/server/errors/HttpError";
import z from "zod";

export default withPermission(
  async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
      exportEmployeesSchema.safeParse(query)
    );

    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_QUERY",
        "Parameter query ekspor tidak valid",
        z.treeifyError(parsed.error).properties
      );
    }

    return withTransaction(async (client) => {
      const { employees } = await employeeService.getEmployees(client, parsed.data);

      // Log Activity
      await logActivity(client, {
        user_id: event.context.user.id,
        action: "ACCESS",
        module: "EMPLOYEE_MANAGEMENT",
        description: `Ekspor data pegawai ke Excel (${employees.length} data)`,
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Employee Directory");

      // Define columns
      worksheet.columns = [
        { header: "NIP", key: "nip", width: 18 },
        { header: "Full Name", key: "name", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone Number", key: "phone", width: 18 },
        { header: "Position", key: "position", width: 20 },
        { header: "Department", key: "department", width: 20 },
        { header: "Role", key: "role", width: 18 },
        { header: "Join Date", key: "join_date", width: 16 },
        { header: "Status", key: "status", width: 12 },
      ];

      // Add rows
      employees.forEach((emp: any) => {
        worksheet.addRow({
          nip: emp.nip,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          position: emp.position_name || emp.position || "-",
          department: emp.department_name || emp.department || "-",
          role: emp.role_name || "Pegawai",
          join_date: emp.join_date ? new Date(emp.join_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-",
          status: emp.status ? "Active" : "Inactive",
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
        'attachment; filename="employee-directory.xlsx"',
      );

      return buffer;
    });
  },
  [{ module: "employees", action: "read" }],
);
