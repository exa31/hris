import { z } from 'zod'

export const holidaySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Holiday name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  description: z.string().nullable().optional(),
  is_recurring: z.boolean().default(false),
})

export const searchHolidaySchema = z.object({
  year: z.coerce.number().optional(),
  month: z.coerce.number().optional(),
  search: z.string().optional(),
})

export type Holiday = z.infer<typeof holidaySchema>
export type CreateHolidayInput = z.infer<typeof holidaySchema>
export type UpdateHolidayInput = Partial<CreateHolidayInput>
export type SearchHolidayInput = z.infer<typeof searchHolidaySchema>
