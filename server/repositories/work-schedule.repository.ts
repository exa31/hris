import type { PoolClient } from 'pg'
import type { WorkScheduleItem } from '~~/server/model/work-schedule.model'

export async function getWorkSchedules(client: PoolClient): Promise<WorkScheduleItem[]> {
  const result = await client.query(`
    SELECT id, day_of_week, day_name, is_work_day,
           to_char(start_time, 'HH24:MI:SS') as start_time,
           to_char(end_time, 'HH24:MI:SS') as end_time,
           created_at, updated_at
    FROM work_schedules
    ORDER BY CASE WHEN day_of_week = 0 THEN 7 ELSE day_of_week END ASC
  `)
  return result.rows
}

export async function getWorkScheduleMap(client: PoolClient): Promise<Map<number, WorkScheduleItem>> {
  const schedules = await getWorkSchedules(client)
  const map = new Map<number, WorkScheduleItem>()
  for (const s of schedules) {
    map.set(s.day_of_week, s)
  }
  return map
}

export async function updateWorkSchedule(
  client: PoolClient,
  schedule: WorkScheduleItem
): Promise<WorkScheduleItem> {
  const result = await client.query(
    `
    UPDATE work_schedules
    SET is_work_day = $1,
        start_time = $2,
        end_time = $3,
        updated_at = NOW()
    WHERE day_of_week = $4
    RETURNING id, day_of_week, day_name, is_work_day,
              to_char(start_time, 'HH24:MI:SS') as start_time,
              to_char(end_time, 'HH24:MI:SS') as end_time
  `,
    [schedule.is_work_day, schedule.start_time, schedule.end_time, schedule.day_of_week]
  )
  return result.rows[0]
}

export async function bulkUpdateWorkSchedules(
  client: PoolClient,
  schedules: WorkScheduleItem[]
): Promise<WorkScheduleItem[]> {
  const updated: WorkScheduleItem[] = []
  for (const schedule of schedules) {
    const res = await updateWorkSchedule(client, schedule)
    if (res) updated.push(res)
  }
  return updated
}
