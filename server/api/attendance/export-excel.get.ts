import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as attendanceService from "~~/server/services/attendance.service";
import ExcelJS from "exceljs";
import { logActivity } from "~~/server/services/activity-log.service";
import { searchAttendanceSchema } from "~~/server/model/attendance.model";

export default withPermission(
  async (event) => {
    const query = getQuery(event);
    
    const params = {
      ...query,
      limit: -1,
      offset: 0,
    };
    
    const validation = searchAttendanceSchema.safeParse(params);
    
    if (!validation.success) {
      throw createError({ statusCode: 400, message: "Invalid parameters" });
    }

    return withTransaction(async (client) => {
      const { attendances } = await attendanceService.getAttendances(client, validation.data);

      await logActivity(client, {
        user_id: event.context.user.id,
        action: "ACCESS",
        module: "ATTENDANCE",
        description: `Ekspor data presensi ke Excel (${attendances.length} data)`,
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Presensi");

      worksheet.columns = [
        { header: "NIP", key: "nip", width: 15 },
        { header: "Nama Pegawai", key: "name", width: 30 },
        { header: "Departemen", key: "department", width: 20 },
        { header: "Jabatan", key: "position", width: 20 },
        { header: "Tanggal", key: "date", width: 15 },
        { header: "Jam Masuk", key: "clock_in", width: 15 },
        { header: "Jam Keluar", key: "clock_out", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Catatan", key: "notes", width: 30 },
      ];

      attendances.forEach((att: any) => {
        worksheet.addRow({
          nip: att.nip,
          name: att.employee_name,
          department: att.department,
          position: att.position,
          date: new Date(att.date).toLocaleDateString("id-ID"),
          clock_in: att.clock_in || "-",
          clock_out: att.clock_out || "-",
          status: att.status,
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
        'attachment; filename="data-presensi.xlsx"',
      );

      return buffer;
    });
  },
  [{ module: "attendance", action: "read" }],
);
