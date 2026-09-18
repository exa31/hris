import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import { sendSuccess } from "~~/server/utils/response";
import * as notificationService from "~~/server/services/notification.service";

export default withPermission(async (event) => {
  const userId = Number(event.context.user.id);

  return withTransaction(async (client) => {
    const updatedCount = await notificationService.markAllNotificationsAsRead(
      client,
      userId,
    );
    return sendSuccess(
      event,
      { updated_count: updatedCount },
      "Semua notifikasi berhasil ditandai sebagai telah dibaca",
    );
  });
}, []);
