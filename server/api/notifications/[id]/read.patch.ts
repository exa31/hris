import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import { sendSuccess } from "~~/server/utils/response";
import * as notificationService from "~~/server/services/notification.service";
import { HttpError } from "~~/server/errors/HttpError";

export default withPermission(async (event) => {
  const userId = Number(event.context.user.id);
  const notificationId = Number(event.context.params?.id);

  if (!notificationId || isNaN(notificationId)) {
    throw new HttpError(400, "INVALID_ID", "ID notifikasi tidak valid");
  }

  return withTransaction(async (client) => {
    const result = await notificationService.markNotificationAsRead(
      client,
      userId,
      notificationId,
    );
    return sendSuccess(event, result, "Notifikasi ditandai sebagai dibaca");
  });
}, []);
