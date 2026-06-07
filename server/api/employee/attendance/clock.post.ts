import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import { sendSuccess } from "~~/server/utils/response";
import { HttpError } from "~~/server/errors/HttpError";
import { attendanceClockSchema } from "~~/server/model/attendance.model";
import * as attendanceService from "~~/server/services/attendance.service";
import z from "zod";

export default withPermission(async (event) => {
  const parsed = await readValidatedBody(event, (body) => attendanceClockSchema.safeParse(body));

  if (!parsed.success) {
    throw new HttpError(400, "INVALID_REQUEST", "Invalid request body", z.treeifyError(parsed.error).properties);
  }

  const { type } = parsed.data;
  const userId = event.context.user.id;

  return withTransaction(async (client) => {
    if (type === "in") {
      const result = await attendanceService.clockIn(client, userId);
      return sendSuccess(event, result);
    } else {
      const result = await attendanceService.clockOut(client, userId);
      return sendSuccess(event, result);
    }
  });
}, []);
