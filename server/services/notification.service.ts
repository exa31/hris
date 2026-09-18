import type { PoolClient } from "pg";
import * as notificationRepo from "~~/server/repositories/notification.repository";
import type { CreateNotificationInput } from "~~/server/model/notification.model";

export async function getUserNotifications(
  client: PoolClient,
  userId: number,
  limit = 25,
) {
  const [notifications, unreadCount] = await Promise.all([
    notificationRepo.getUserNotifications(client, userId, limit),
    notificationRepo.getUnreadCount(client, userId),
  ]);

  return {
    notifications,
    unread_count: unreadCount,
  };
}

export async function markNotificationAsRead(
  client: PoolClient,
  userId: number,
  notificationId: number,
) {
  return notificationRepo.markAsRead(client, userId, notificationId);
}

export async function markAllNotificationsAsRead(
  client: PoolClient,
  userId: number,
) {
  return notificationRepo.markAllAsRead(client, userId);
}

export async function createNotification(
  client: PoolClient,
  data: CreateNotificationInput,
) {
  return notificationRepo.createNotification(client, data);
}
