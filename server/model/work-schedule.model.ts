import { z } from 'zod'

export const workScheduleItemSchema = z.object({
  id: z.number().optional(),
  day_of_week: z.number().int().min(0).max(6),
  day_name: z.string().min(1),
  is_work_day: z.boolean(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Time format must be HH:mm or HH:mm:ss'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Time format must be HH:mm or HH:mm:ss'),
})

export const updateWorkSchedulesSchema = z.object({
  schedules: z.array(workScheduleItemSchema).min(1),
})

export type WorkScheduleItem = z.infer<typeof workScheduleItemSchema>
export type UpdateWorkSchedulesInput = z.infer<typeof updateWorkSchedulesSchema>
