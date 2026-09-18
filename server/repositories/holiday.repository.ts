import type { PoolClient } from 'pg'
import type { Holiday, CreateHolidayInput, UpdateHolidayInput, SearchHolidayInput } from '~~/server/model/holiday.model'

export async function getHolidays(client: PoolClient, params: SearchHolidayInput = {}): Promise<Holiday[]> {
  const conditions: string[] = ['1=1']
  const values: any[] = []
  let pIdx = 1

  if (params.year) {
    conditions.push(`EXTRACT(YEAR FROM date) = $${pIdx}`)
    values.push(params.year)
    pIdx++
  }

  if (params.month) {
    conditions.push(`EXTRACT(MONTH FROM date) = $${pIdx}`)
    values.push(params.month)
    pIdx++
  }

  if (params.search) {
    conditions.push(`(name ILIKE $${pIdx} OR description ILIKE $${pIdx})`)
    values.push(`%${params.search}%`)
    pIdx++
  }

  const result = await client.query(`
    SELECT id, name, to_char(date, 'YYYY-MM-DD') as date, description, is_recurring, created_at, updated_at
    FROM holidays
    WHERE ${conditions.join(' AND ')}
    ORDER BY date ASC
  `, values)

  return result.rows
}

export async function getHolidayById(client: PoolClient, id: number): Promise<Holiday | null> {
  const result = await client.query(`
    SELECT id, name, to_char(date, 'YYYY-MM-DD') as date, description, is_recurring, created_at, updated_at
    FROM holidays
    WHERE id = $1
  `, [id])
  return result.rows[0] || null
}

export async function getHolidayByDate(client: PoolClient, date: string): Promise<Holiday | null> {
  const result = await client.query(`
    SELECT id, name, to_char(date, 'YYYY-MM-DD') as date, description, is_recurring, created_at, updated_at
    FROM holidays
    WHERE date = $1
  `, [date])
  return result.rows[0] || null
}

export async function getHolidaysBetweenDates(
  client: PoolClient,
  startDate: string,
  endDate: string
): Promise<Holiday[]> {
  const result = await client.query(`
    SELECT id, name, to_char(date, 'YYYY-MM-DD') as date, description, is_recurring
    FROM holidays
    WHERE date >= $1 AND date <= $2
    ORDER BY date ASC
  `, [startDate, endDate])
  return result.rows
}

export async function createHoliday(client: PoolClient, data: CreateHolidayInput): Promise<Holiday> {
  const result = await client.query(`
    INSERT INTO holidays (name, date, description, is_recurring)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, to_char(date, 'YYYY-MM-DD') as date, description, is_recurring, created_at, updated_at
  `, [data.name, data.date, data.description || null, data.is_recurring ?? false])
  return result.rows[0]
}

export async function updateHoliday(
  client: PoolClient,
  id: number,
  data: UpdateHolidayInput
): Promise<Holiday | null> {
  const fields: string[] = []
  const values: any[] = []
  let pIdx = 1

  if (data.name !== undefined) {
    fields.push(`name = $${pIdx}`)
    values.push(data.name)
    pIdx++
  }
  if (data.date !== undefined) {
    fields.push(`date = $${pIdx}`)
    values.push(data.date)
    pIdx++
  }
  if (data.description !== undefined) {
    fields.push(`description = $${pIdx}`)
    values.push(data.description)
    pIdx++
  }
  if (data.is_recurring !== undefined) {
    fields.push(`is_recurring = $${pIdx}`)
    values.push(data.is_recurring)
    pIdx++
  }

  fields.push('updated_at = NOW()')
  values.push(id)

  const result = await client.query(`
    UPDATE holidays
    SET ${fields.join(', ')}
    WHERE id = $${pIdx}
    RETURNING id, name, to_char(date, 'YYYY-MM-DD') as date, description, is_recurring, created_at, updated_at
  `, values)

  return result.rows[0] || null
}

export async function deleteHoliday(client: PoolClient, id: number): Promise<boolean> {
  const result = await client.query(`DELETE FROM holidays WHERE id = $1 RETURNING id`, [id])
  return (result.rowCount ?? 0) > 0
}
