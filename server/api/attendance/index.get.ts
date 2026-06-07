import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as attendanceService from "~~/server/services/attendance.service";
import { sendSuccess } from "~~/server/utils/response";
import { searchAttendanceSchema } from "~~/server/model/attendance.model";
import { HttpError } from "~~/server/errors/HttpError";
import { logActivity } from "~~/server/services/activity-log.service";
import z from "zod";

export default withPermission(
  async (event) => {
    const validation = await getValidatedQuery(event, (q) =>
      searchAttendanceSchema.safeParse(q),
    );

    if (!validation.success) {
      throw new HttpError(
        400,
        "INVALID_QUERY",
        "Parameter query tidak valid",
        z.treeifyError(validation.error).properties,
      );
    }

    return withTransaction(async (client) => {
      const data = await attendanceService.getAttendances(
        client,
        validation.data,
      );

      await logActivity(client, {
        user_id: event.context.user.id,
        action: "ACCESS",
        module: "ATTENDANCE",
        description: "Melihat daftar absensi",
      });

      return sendSuccess(event, data);
    });
  },
  [{ module: "attendance", action: "read" }],
);
