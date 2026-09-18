import type { PoolClient } from "pg";
import type {
  Notification,
  CreateNotificationInput,
} from "~~/server/model/notification.model";

export async function getUserNotifications(
  client: PoolClient,
  userId: number,
  limit = 25,
): Promise<Notification[]> {
  const query = `
    SELECT 
      n.id,
      n.user_id,
      n.title,
      n.message,
      n.type,
      n.icon,
      n.link,
      n.created_at,
      n.updated_at,
      (unr.id IS NOT NULL) AS is_read,
      unr.read_at
    FROM notifications n
    LEFT JOIN user_notification_reads unr 
      ON n.id = unr.notification_id AND unr.user_id = $1
    WHERE n.user_id = $1 OR n.user_id IS NULL
    ORDER BY n.created_at DESC
    LIMIT $2
  `;

  const { rows } = await client.query(query, [userId, limit]);
  return rows;
}

export async function getUnreadCount(
  client: PoolClient,
  userId: number,
): Promise<number> {
  const query = `
    SELECT COUNT(*)::int AS unread_count
    FROM notifications n
    LEFT JOIN user_notification_reads unr 
      ON n.id = unr.notification_id AND unr.user_id = $1
    WHERE (n.user_id = $1 OR n.user_id IS NULL)
      AND unr.id IS NULL
  `;

  const { rows } = await client.query(query, [userId]);
  return rows[0]?.unread_count || 0;
}

export async function markAsRead(
  client: PoolClient,
  userId: number,
  notificationId: number,
) {
  const query = `
    INSERT INTO user_notification_reads (user_id, notification_id, read_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, notification_id) DO UPDATE SET read_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  const { rows } = await client.query(query, [userId, notificationId]);
  return rows[0];
}

export async function markAllAsRead(client: PoolClient, userId: number) {
  const query = `
    INSERT INTO user_notification_reads (user_id, notification_id, read_at)
    SELECT $1, n.id, CURRENT_TIMESTAMP
    FROM notifications n
    WHERE (n.user_id = $1 OR n.user_id IS NULL)
    ON CONFLICT (user_id, notification_id) DO NOTHING
  `;

  const res = await client.query(query, [userId]);
  return res.rowCount;
}

export async function createNotification(
  client: PoolClient,
  data: CreateNotificationInput,
): Promise<Notification> {
  const query = `
    INSERT INTO notifications (user_id, title, message, type, icon, link)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    data.user_id ?? null,
    data.title,
    data.message,
    data.type || "broadcast",
    data.icon || "bi bi-bell-fill",
    data.link ?? null,
  ];

  const { rows } = await client.query(query, values);
  return rows[0];
}
