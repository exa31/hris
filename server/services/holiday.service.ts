import type { PoolClient } from 'pg'
import * as holidayRepo from '~~/server/repositories/holiday.repository'
import * as workScheduleRepo from '~~/server/repositories/work-schedule.repository'
import { HttpError } from '~~/server/errors/HttpError'
import type { CreateHolidayInput, UpdateHolidayInput, SearchHolidayInput, Holiday } from '~~/server/model/holiday.model'

export async function getHolidays(client: PoolClient, params: SearchHolidayInput = {}): Promise<Holiday[]> {
  return await holidayRepo.getHolidays(client, params)
}

export async function getHolidayById(client: PoolClient, id: number): Promise<Holiday> {
  const holiday = await holidayRepo.getHolidayById(client, id)
  if (!holiday) {
    throw new HttpError(404, 'NOT_FOUND', 'Holiday not found')
  }
  return holiday
}

/**
 * Synchronize attendance when a date becomes a holiday:
 * - If the date is already a regular weekly day off (e.g. weekend), do not alter attendance.
 * - If it was a regular work day:
 *   1. Remove 'Alpha' records without clock-in on that date.
 *   2. If there are approved leaves spanning this date that created leave attendances ('Izin'/'Sakit'),
 *      remove the attendance on this holiday and decrement total_days so the employee's leave balance is preserved.
 */
async function syncAttendanceOnHolidayAdded(client: PoolClient, dateStr: string) {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()
  const scheduleMap = await workScheduleRepo.getWorkScheduleMap(client)
  const daySchedule = scheduleMap.get(dayOfWeek)
  const isWeeklyWorkDay = daySchedule ? daySchedule.is_work_day : (dayOfWeek !== 0 && dayOfWeek !== 6)

  // Kecuali day off rutin (tetap pakai aturan lama)
  if (!isWeeklyWorkDay) {
    return
  }

  // 1. Remove Alpha attendances without clock_in on this newly declared holiday
  await client.query(`
    DELETE FROM attendances
    WHERE date = $1 AND status = 'Alpha' AND clock_in IS NULL
  `, [dateStr])

  // 2. Find approved leaves that cover this holiday
  const affectedLeavesRes = await client.query(`
    SELECT lr.id, lr.employee_id, lr.total_days, lt.name as leave_type_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.status = 'Approved'
      AND lr.start_date <= $1
      AND lr.end_date >= $1
  `, [dateStr])

  for (const lr of affectedLeavesRes.rows) {
    // Check if there was an attendance record created for this leave
    const attRes = await client.query(`
      SELECT id FROM attendances
      WHERE employee_id = $1 AND date = $2 AND (status = 'Izin' OR status = 'Sakit')
    `, [lr.employee_id, dateStr])

    if (attRes.rows.length > 0) {
      await client.query(`DELETE FROM attendances WHERE id = $1`, [attRes.rows[0].id])
      // Decrement total_days if greater than 1
      if (lr.total_days > 1) {
        await client.query(`
          UPDATE leave_requests
          SET total_days = total_days - 1, updated_at = NOW()
          WHERE id = $1
        `, [lr.id])
      }
    }
  }
}

/**
 * Synchronize attendance when a holiday is removed / canceled:
 * - If the date was a weekly work day:
 *   If an approved leave covers this date, restore the attendance record ('Izin'/'Sakit') and increment total_days.
 */
async function syncAttendanceOnHolidayRemoved(client: PoolClient, dateStr: string) {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()
  const scheduleMap = await workScheduleRepo.getWorkScheduleMap(client)
  const daySchedule = scheduleMap.get(dayOfWeek)
  const isWeeklyWorkDay = daySchedule ? daySchedule.is_work_day : (dayOfWeek !== 0 && dayOfWeek !== 6)

  if (!isWeeklyWorkDay) {
    return
  }

  // Find approved leaves covering this date
  const affectedLeavesRes = await client.query(`
    SELECT lr.id, lr.employee_id, lr.reason, lt.name as leave_type_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.status = 'Approved'
      AND lr.start_date <= $1
      AND lr.end_date >= $1
  `, [dateStr])

  for (const lr of affectedLeavesRes.rows) {
    const leaveTypeName = (lr.leave_type_name || '').toLowerCase()
    const attendanceStatus = (leaveTypeName.includes('sakit') || leaveTypeName.includes('sick')) ? 'Sakit' : 'Izin'

    // Check if attendance already exists
    const existingAtt = await client.query(`
      SELECT id FROM attendances WHERE employee_id = $1 AND date = $2
    `, [lr.employee_id, dateStr])

    if (existingAtt.rows.length === 0) {
      await client.query(`
        INSERT INTO attendances (employee_id, date, status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [lr.employee_id, dateStr, attendanceStatus, `Leave: ${lr.reason || ''}`])

      await client.query(`
        UPDATE leave_requests
        SET total_days = total_days + 1, updated_at = NOW()
        WHERE id = $1
      `, [lr.id])
    }
  }
}

export async function createHoliday(client: PoolClient, data: CreateHolidayInput): Promise<Holiday> {
  const existing = await holidayRepo.getHolidayByDate(client, data.date)
  if (existing) {
    throw new HttpError(400, 'DUPLICATE_DATE', `Date ${data.date} is already registered as a holiday (${existing.name})`)
  }

  const holiday = await holidayRepo.createHoliday(client, data)
  await syncAttendanceOnHolidayAdded(client, data.date)
  return holiday
}

export async function updateHoliday(
  client: PoolClient,
  id: number,
  data: UpdateHolidayInput
): Promise<Holiday> {
  const existing = await holidayRepo.getHolidayById(client, id)
  if (!existing) {
    throw new HttpError(404, 'NOT_FOUND', 'Holiday not found')
  }

  if (data.date && data.date !== existing.date) {
    const duplicate = await holidayRepo.getHolidayByDate(client, data.date)
    if (duplicate && duplicate.id !== id) {
      throw new HttpError(400, 'DUPLICATE_DATE', `Date ${data.date} is already registered as a holiday (${duplicate.name})`)
    }
  }

  const updated = await holidayRepo.updateHoliday(client, id, data)
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', 'Holiday not found')
  }

  // If date changed, revert old date and apply new date
  if (data.date && data.date !== existing.date) {
    await syncAttendanceOnHolidayRemoved(client, existing.date)
    await syncAttendanceOnHolidayAdded(client, data.date)
  }

  return updated
}

export async function deleteHoliday(client: PoolClient, id: number): Promise<boolean> {
  const existing = await holidayRepo.getHolidayById(client, id)
  if (!existing) {
    throw new HttpError(404, 'NOT_FOUND', 'Holiday not found')
  }

  const deleted = await holidayRepo.deleteHoliday(client, id)
  if (deleted) {
    await syncAttendanceOnHolidayRemoved(client, existing.date)
  }
  return deleted
}
