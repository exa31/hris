import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as employeeService from "~~/server/services/employee.service";
import { sendSuccess } from "~~/server/utils/response";
import { searchEmployeesSchema } from "~~/server/model/employee.model";
import { HttpError } from "~~/server/errors/HttpError";
import z from "zod";
import { logActivity } from "~~/server/services/activity-log.service";

export default withPermission(
  async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
      searchEmployeesSchema.safeParse(query),
    );

    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_QUERY",
        "Satu atau lebih parameter query tidak valid",
        z.treeifyError(parsed.error).properties,
      );
    }

    return withTransaction(async (client) => {
      const data = await employeeService.getEmployees(client, parsed.data);

      // Log Activity
      await logActivity(client, {
        user_id: event.context.user.id,
        action: "ACCESS",
        module: "EMPLOYEE_MANAGEMENT",
        description: "Melihat daftar pegawai",
      });

      return sendSuccess(event, data);
    });
  },
  [{ module: "employees", action: "read" }],
);
