import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import * as announcementService from "~~/server/services/announcement.service";
import { sendSuccess } from "~~/server/utils/response";
import { searchAnnouncementSchema } from "~~/server/model/announcement.model";
import { HttpError } from "~~/server/errors/HttpError";
import { logActivity } from "~~/server/services/activity-log.service";
import z from "zod";

export default withPermission(
  async (event) => {
    const parsed = await getValidatedQuery(
      event,
      searchAnnouncementSchema.safeParse,
    );

    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_QUERY",
        "Parameter query tidak valid",
        z.treeifyError(parsed.error).properties,
      );
    }

    return withTransaction(async (client) => {
      const data = await announcementService.getAnnouncements(
        client,
        parsed.data,
      );

      await logActivity(client, {
        user_id: event.context.user.id,
        action: "ACCESS",
        module: "ANNOUNCEMENTS",
        description: "Melihat daftar pengumuman",
      });

      return sendSuccess(event, data);
    });
  },
  [{ module: "announcements", action: "read" }],
);
