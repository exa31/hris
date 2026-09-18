import { withPermission } from "~~/server/utils/withPermission";
import { withTransaction } from "~~/server/db/postgres";
import { sendSuccess } from "~~/server/utils/response";
import * as notificationService from "~~/server/services/notification.service";

export default withPermission(async (event) => {
  const userId = Number(event.context.user.id);

  return withTransaction(async (client) => {
    const data = await notificationService.getUserNotifications(client, userId);
    return sendSuccess(event, data);
  });
}, []);
