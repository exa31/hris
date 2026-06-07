import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as attendanceService from "~~/server/services/attendance.service";
import { sendSuccess } from "~~/server/utils/response";
import { logActivity } from "~~/server/services/activity-log.service";

import { HttpError } from "~~/server/errors/HttpError";
import { updateAttendanceSchema } from "~~/server/model/attendance.model";
import z from "zod";

export default withPermission(
  async (event) => {
    const id = Number(getRouterParam(event, "id"));
    const validation = await readValidatedBody(event, (data) =>
      updateAttendanceSchema.safeParse({ ...(data as Object), id }),
    );

    if (!validation.success) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Data absensi tidak valid",
        z.treeifyError(validation.error).properties,
      );
    }

    return withTransaction(async (client) => {
      const data = await attendanceService.updateAttendance(
        client,
        id,
        validation.data,
      );

      await logActivity(client, {
        user_id: event.context.user.id,
        action: "UPDATE",
        module: "ATTENDANCE",
        description: `Mengubah data absensi ID: ${id}`,
        metadata: { attendance_id: id },
      });

      return sendSuccess(event, data, "Data absensi berhasil diubah");
    });
  },
  [{ module: "attendance", action: "update" }],
);
