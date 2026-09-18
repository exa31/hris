import z from "zod";

export const notificationModel = z.object({
  id: z.number(),
  user_id: z.number().nullable().optional(),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  type: z.string().default("broadcast"),
  icon: z.string().default("bi bi-bell-fill"),
  link: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  is_read: z.boolean().default(false),
  read_at: z.string().nullable().optional(),
});

export type Notification = z.infer<typeof notificationModel>;

export const createNotificationSchema = z.object({
  user_id: z.number().nullable().optional(),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  type: z.string().default("broadcast"),
  icon: z.string().default("bi bi-bell-fill"),
  link: z.string().nullable().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
