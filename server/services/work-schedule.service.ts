import type { PoolClient } from 'pg'
import * as workScheduleRepo from '~~/server/repositories/work-schedule.repository'
import * as holidayRepo from '~~/server/repositories/holiday.repository'
import type { WorkScheduleItem } from '~~/server/model/work-schedule.model'

export async function getWorkSchedules(client: PoolClient): Promise<WorkScheduleItem[]> {
  return await workScheduleRepo.getWorkSchedules(client)
}

export async function updateWorkSchedules(
  client: PoolClient,
  schedules: WorkScheduleItem[]
): Promise<WorkScheduleItem[]> {
  return await workScheduleRepo.bulkUpdateWorkSchedules(client, schedules)
}

/**
 * Checks whether a given date is an official working day:
 * 1. Checks work_schedules table for day_of_week
 * 2. Checks holidays table for that specific date
 */
export async function isWorkDay(client: PoolClient, dateStr: string): Promise<boolean> {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay()

  const scheduleMap = await workScheduleRepo.getWorkScheduleMap(client)
  const dayConfig = scheduleMap.get(dayOfWeek)

  // If not configured, default weekend = off
  const isWeeklyWorkDay = dayConfig ? dayConfig.is_work_day : (dayOfWeek !== 0 && dayOfWeek !== 6)
  if (!isWeeklyWorkDay) {
    return false
  }

  // Check if holiday
  const holiday = await holidayRepo.getHolidayByDate(client, dateStr)
  if (holiday) {
    return false
  }

  return true
}

export function formatTimeAmPm(timeStr: string | null | undefined): string {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1] || '00'
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const strHours = hours < 10 ? `0${hours}` : `${hours}`
  return `${strHours}:${minutes} ${ampm}`
}

export async function getWorkSchedulePolicy(client: PoolClient) {
  const schedules = await workScheduleRepo.getWorkSchedules(client)
  const workDays = schedules.filter((s) => s.is_work_day)

  const dayNameMap: Record<number, string> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  }

  let workDaysSummary = ''
  if (workDays.length === 5 && workDays.every((d) => d.day_of_week >= 1 && d.day_of_week <= 5)) {
    workDaysSummary = 'Monday to Friday'
  } else if (workDays.length === 6 && workDays.every((d) => d.day_of_week >= 1 && d.day_of_week <= 6)) {
    workDaysSummary = 'Monday to Saturday'
  } else if (workDays.length === 7) {
    workDaysSummary = 'Monday to Sunday'
  } else if (workDays.length > 0) {
    workDaysSummary = workDays.map((d) => dayNameMap[d.day_of_week] || d.day_name).join(', ')
  } else {
    workDaysSummary = 'No active work days'
  }

  const primarySchedule = workDays[0] || schedules[0]
  const startTime = primarySchedule?.start_time ? formatTimeAmPm(primarySchedule.start_time) : '08:00 AM'
  const endTime = primarySchedule?.end_time ? formatTimeAmPm(primarySchedule.end_time) : '05:00 PM'

  // Today's schedule
  const todayDayOfWeek = new Date().getDay()
  const todaySchedule = schedules.find((s) => s.day_of_week === todayDayOfWeek)
  const todayIsWorkDay = todaySchedule ? todaySchedule.is_work_day : false
  const todayStart = todaySchedule?.start_time ? formatTimeAmPm(todaySchedule.start_time) : startTime
  const todayEnd = todaySchedule?.end_time ? formatTimeAmPm(todaySchedule.end_time) : endTime

  return {
    workDaysSummary,
    startTime,
    endTime,
    gracePeriodMinutes: 15,
    todayIsWorkDay,
    todayHours: todayIsWorkDay ? `${todayStart} - ${todayEnd}` : 'Day Off',
    text: `Standard work hours start from ${startTime} to ${endTime} (${workDaysSummary}). Grace period for late arrivals is 15 minutes.`
  }
}
