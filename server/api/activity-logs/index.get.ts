import { HttpError } from "./../../errors/HttpError";
import { findActivityLogFilterSchema } from "./../../model/activity-log.model";
import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as activityLogService from "~~/server/services/activity-log.service";

export default withPermission(
  async (event) => {
    const parsed = await getValidatedQuery(event, (query) =>
      findActivityLogFilterSchema.safeParse(query),
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
      return activityLogService.getActivityLogs(client, parsed.data);
    });
  },
  [{ module: "logs", action: "read" }],
);
