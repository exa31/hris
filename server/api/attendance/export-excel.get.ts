import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as attendanceService from "~~/server/services/attendance.service";
import ExcelJS from "exceljs";
import { logActivity } from "~~/server/services/activity-log.service";
import { searchAttendanceSchema } from "~~/server/model/attendance.model";

export default withPermission(
  async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
      searchAttendanceSchema.safeParse({ ...query, limit: -1, offset: 0 })
    );

    if (!parsed.success) {
      throw createError({ statusCode: 400, message: "Invalid parameters" });
    }

    return withTransaction(async (client) => {
      const { attendances } = await attendanceService.getAttendances(client, parsed.data);

      await logActivity(client, {
        user_id: event.context.user.id,
        action: "ACCESS",
        module: "ATTENDANCE",
        description: `Exported attendance records to Excel (${attendances.length} records)`,
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance Records");

      worksheet.columns = [
        { header: "NIP", key: "nip", width: 18 },
        { header: "Employee Name", key: "name", width: 30 },
        { header: "Department", key: "department", width: 20 },
        { header: "Position", key: "position", width: 20 },
        { header: "Date", key: "date", width: 16 },
        { header: "Clock In", key: "clock_in", width: 15 },
        { header: "Clock Out", key: "clock_out", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Notes", key: "notes", width: 30 },
      ];

      const formatStatus = (status: string) => {
        if (!status) return "Present";
        if (status === "Hadir" || status === "Present") return "Present";
        if (status === "Izin" || status === "Permit") return "Permit";
        if (status === "Sakit" || status === "Sick") return "Sick";
        if (status === "Alpha" || status === "Absent") return "Absent";
        return status;
      };

      attendances.forEach((att: any) => {
        worksheet.addRow({
          nip: att.nip,
          name: att.employee_name || att.name,
          department: att.department || "-",
          position: att.position || "-",
          date: att.date ? new Date(att.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-",
          clock_in: att.clock_in || "-",
          clock_out: att.clock_out || "-",
          status: formatStatus(att.status),
          notes: att.notes || "-",
        });
      });

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
        'attachment; filename="attendance-records.xlsx"',
      );

      return buffer;
    });
  },
  [{ module: "attendance", action: "read" }],
);
