/**
 * Attendance Repository
 * Database operations for attendance records
 */

import type { PoolClient } from "pg";
import type {
  CreateAttendanceInput,
  UpdateAttendanceInput,
  SearchAttendanceInput,
} from "~~/server/model/attendance.model";

export async function getAttendances(
  client: PoolClient,
  params: SearchAttendanceInput,
) {
  const conditions: string[] = ["1=1"];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.search) {
    conditions.push(
      `(e.name ILIKE $${paramIndex} OR e.nip::text ILIKE $${paramIndex} OR d.name ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`,
    );
    values.push(`%${params.search.trim()}%`);
    paramIndex++;
  }

  if (params.employee_id) {
    conditions.push(`a.employee_id = $${paramIndex}`);
    values.push(params.employee_id);
    paramIndex++;
  }

  if (params.status) {
    conditions.push(`a.status = $${paramIndex}`);
    values.push(params.status);
    paramIndex++;
  }

  if (params.month) {
    conditions.push(`EXTRACT(MONTH FROM a.date) = $${paramIndex}`);
    values.push(params.month);
    paramIndex++;
  }

  if (params.year) {
    conditions.push(`EXTRACT(YEAR FROM a.date) = $${paramIndex}`);
    values.push(params.year);
    paramIndex++;
  }

  if (params.date) {
    conditions.push(`a.date = $${paramIndex}`);
    values.push(params.date);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");

  const countResult = await client.query(
    `SELECT COUNT(*) as total FROM attendances a
         JOIN employees e ON a.employee_id = e.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         WHERE ${whereClause}`,
    values,
  );

  const total = parseInt(countResult.rows[0].total, 10);

  let limitOffsetClause = "";
  if (params.limit !== -1) {
    limitOffsetClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(params.limit, params.offset);
  }

  const dataResult = await client.query(
    `SELECT a.*, e.name as employee_name, e.name as name, e.nip, e.photo_url, d.name as department, p.name as position
         FROM attendances a
         JOIN employees e ON a.employee_id = e.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         WHERE ${whereClause}
         ORDER BY a.date DESC, e.name ASC
         ${limitOffsetClause}`,
    values,
  );

  return { rows: dataResult.rows, total };
}

export async function getAttendanceById(client: PoolClient, id: number) {
  const result = await client.query(
    `SELECT a.*, e.name as employee_name, e.name as name, e.nip, e.photo_url, d.name as department, p.name as position
         FROM attendances a
         JOIN employees e ON a.employee_id = e.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         WHERE a.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function createAttendance(
  client: PoolClient,
  data: CreateAttendanceInput,
) {
  const result = await client.query(
    `INSERT INTO attendances (employee_id, date, clock_in, clock_out, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
    [
      data.employee_id,
      data.date,
      data.clock_in || null,
      data.clock_out || null,
      data.status,
      data.notes || null,
    ],
  );
  return result.rows[0];
}

export async function updateAttendance(
  client: PoolClient,
  id: number,
  data: Partial<UpdateAttendanceInput>,
) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.clock_in !== undefined) {
    fields.push(`clock_in = $${paramIndex}`);
    values.push(data.clock_in);
    paramIndex++;
  }

  if (data.clock_out !== undefined) {
    fields.push(`clock_out = $${paramIndex}`);
    values.push(data.clock_out);
    paramIndex++;
  }

  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(data.status);
    paramIndex++;
  }

  if (data.notes !== undefined) {
    fields.push(`notes = $${paramIndex}`);
    values.push(data.notes);
    paramIndex++;
  }

  fields.push(`updated_at = NOW()`);

  if (fields.length === 1) return null; // only updated_at, nothing to update

  const result = await client.query(
    `UPDATE attendances SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    [...values, id],
  );
  return result.rows[0] || null;
}

export async function deleteAttendance(client: PoolClient, id: number) {
  const result = await client.query(
    `DELETE FROM attendances WHERE id = $1 RETURNING id`,
    [id],
  );
  return result.rowCount! > 0;
}

export async function getTodayAttendance(
  client: PoolClient,
  employeeId: number,
  date: string,
) {
  const result = await client.query(
    `SELECT id, clock_in, clock_out FROM attendances WHERE employee_id = $1 AND date = $2`,
    [employeeId, date],
  );
  return { row: result.rows[0] || null };
}

export async function insertAttendance(
  client: PoolClient,
  employeeId: number,
  date: string,
  clockIn: string,
  status: string,
) {
  const result = await client.query(
    `INSERT INTO attendances (employee_id, date, clock_in, status) VALUES ($1, $2, $3, $4) RETURNING *`,
    [employeeId, date, clockIn, status],
  );
  return result.rows[0];
}

export async function updateClockOut(
  client: PoolClient,
  attendanceId: number,
  clockOut: string,
) {
  const result = await client.query(
    `UPDATE attendances SET clock_out = $1 WHERE id = $2 RETURNING *`,
    [clockOut, attendanceId],
  );
  return result.rows[0];
}

export async function getEmployeeAttendances(
  client: PoolClient,
  employeeId: number,
  limitOrParams: number | { limit?: number; month?: number; year?: number } = 100,
) {
  let limit: number | undefined = 100;
  let month: number | undefined;
  let year: number | undefined;

  if (typeof limitOrParams === 'number') {
    limit = limitOrParams;
  } else if (limitOrParams) {
    limit = limitOrParams.limit ?? 100;
    month = limitOrParams.month;
    year = limitOrParams.year;
  }

  const conditions = ['employee_id = $1'];
  const values: any[] = [employeeId];
  let paramIndex = 2;

  if (month && month > 0) {
    conditions.push(`EXTRACT(MONTH FROM date) = $${paramIndex}`);
    values.push(month);
    paramIndex++;
  }

  if (year && year > 0) {
    conditions.push(`EXTRACT(YEAR FROM date) = $${paramIndex}`);
    values.push(year);
    paramIndex++;
  }

  let query = `SELECT id, date, clock_in, clock_out, status, notes FROM attendances WHERE ${conditions.join(' AND ')} ORDER BY date DESC`;

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    values.push(limit);
  }

  const result = await client.query(query, values);
  return result.rows;
}

export interface EmployeeAttendanceQueryParams {
  limit?: number;
  offset?: number;
  month?: number;
  year?: number;
  status?: string;
  search?: string;
}

export async function getEmployeeAttendancesPaginated(
  client: PoolClient,
  employeeId: number,
  params: EmployeeAttendanceQueryParams = {}
): Promise<{
  rows: any[];
  total: number;
}> {
  const limit = params.limit ?? 10;
  const offset = params.offset ?? 0;

  const conditions = ['a.employee_id = $1'];
  const values: any[] = [employeeId];
  let paramIndex = 2;

  if (params.month && params.month > 0) {
    conditions.push(`EXTRACT(MONTH FROM a.date) = $${paramIndex}`);
    values.push(params.month);
    paramIndex++;
  }

  if (params.year && params.year > 0) {
    conditions.push(`EXTRACT(YEAR FROM a.date) = $${paramIndex}`);
    values.push(params.year);
    paramIndex++;
  }

  if (params.status && params.status !== 'All') {
    const s = params.status.toLowerCase();
    if (s === 'present' || s === 'hadir') {
      conditions.push(`a.status = 'Hadir'`);
    } else if (s === 'late' || s === 'terlambat') {
      conditions.push(`a.status = 'Hadir' AND a.clock_in > '08:15:00'`);
    } else if (s === 'leave' || s === 'izin') {
      conditions.push(`a.status = 'Izin'`);
    } else if (s === 'sick' || s === 'sakit') {
      conditions.push(`a.status = 'Sakit'`);
    } else if (s === 'absent' || s === 'alpa' || s === 'alpha') {
      conditions.push(`a.status = 'Alpha'`);
    }
  }

  if (params.search && params.search.trim()) {
    const q = `%${params.search.trim()}%`;
    conditions.push(`(
      a.notes ILIKE $${paramIndex} OR
      to_char(a.date, 'Day') ILIKE $${paramIndex} OR
      to_char(a.date, 'YYYY-MM-DD') ILIKE $${paramIndex} OR
      to_char(a.date, 'DD Mon YYYY') ILIKE $${paramIndex} OR
      to_char(a.date, 'Month') ILIKE $${paramIndex}
    )`);
    values.push(q);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Total count matching the filters
  const countResult = await client.query(
    `SELECT COUNT(*) as total FROM attendances a WHERE ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Query paginated records
  const queryValues = [...values, limit, offset];
  const dataResult = await client.query(
    `SELECT a.id, a.date, a.clock_in, a.clock_out, a.status, a.notes
     FROM attendances a
     WHERE ${whereClause}
     ORDER BY a.date DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    queryValues
  );

  return { rows: dataResult.rows, total };
}

export async function getEmployeeAttendanceStats(
  client: PoolClient,
  employeeId: number,
  params: { month?: number; year?: number } = {}
): Promise<{ on_time: number; late: number; leave: number; sick: number; absent: number; total: number }> {
  const statsConditions = ['employee_id = $1'];
  const statsValues: any[] = [employeeId];
  let sIndex = 2;
  if (params.month && params.month > 0) {
    statsConditions.push(`EXTRACT(MONTH FROM date) = $${sIndex}`);
    statsValues.push(params.month);
    sIndex++;
  }
  if (params.year && params.year > 0) {
    statsConditions.push(`EXTRACT(YEAR FROM date) = $${sIndex}`);
    statsValues.push(params.year);
    sIndex++;
  }

  const statsResult = await client.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'Hadir' AND (clock_in IS NULL OR clock_in <= '08:15:00')) as on_time,
       COUNT(*) FILTER (WHERE status = 'Hadir' AND clock_in > '08:15:00') as late,
       COUNT(*) FILTER (WHERE status = 'Izin') as leave,
       COUNT(*) FILTER (WHERE status = 'Sakit') as sick,
       COUNT(*) FILTER (WHERE status = 'Alpha') as absent,
       COUNT(*) as total_records
     FROM attendances
     WHERE ${statsConditions.join(' AND ')}`,
    statsValues
  );
  const sRow = statsResult.rows[0];
  return {
    on_time: parseInt(sRow?.on_time || '0', 10),
    late: parseInt(sRow?.late || '0', 10),
    leave: parseInt(sRow?.leave || '0', 10),
    sick: parseInt(sRow?.sick || '0', 10),
    absent: parseInt(sRow?.absent || '0', 10),
    total: parseInt(sRow?.total_records || '0', 10),
  };
}

export async function getAttendanceSummary(
  client: PoolClient,
  month: number,
  year: number,
) {
  const result = await client.query(
    `SELECT
            e.id as employee_id,
            e.name as employee_name,
            e.nip,
            d.name as department,
            COUNT(*) FILTER (WHERE a.status = 'Hadir') as hadir,
            COUNT(*) FILTER (WHERE a.status = 'Izin') as izin,
            COUNT(*) FILTER (WHERE a.status = 'Sakit') as sakit,
            COUNT(*) FILTER (WHERE a.status = 'Alpha') as alpha,
            COUNT(*) as total_days
         FROM employees e
         LEFT JOIN attendances a ON e.id = a.employee_id
            AND EXTRACT(MONTH FROM a.date) = $1
            AND EXTRACT(YEAR FROM a.date) = $2
         LEFT JOIN departments d ON e.department_id = d.id
         WHERE e.status = true AND e.deleted_at IS NULL
         GROUP BY e.id, e.name, e.nip, d.name
         ORDER BY e.name`,
    [month, year],
  );
  return result.rows;
}

export async function getEmployeeMonthlyAttendance(
  client: PoolClient,
  employeeId: number,
) {
  const result = await client.query(
    `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status IN ('Hadir') THEN 1 ELSE 0 END) as present
         FROM attendances
         WHERE employee_id = $1
           AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
           AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
    [employeeId],
  );
  const row = result.rows[0];
  return {
    total: parseInt(row?.total || "0"),
    present: parseInt(row?.present || "0"),
  };
}

export async function getTodayStats(client: PoolClient): Promise<{
  hadir: number;
  total_active: number;
  hadir_percent: number;
}> {
  const today = new Date().toISOString().split("T")[0];

  const result = await client.query(
    `SELECT
            COUNT(DISTINCT a.employee_id) FILTER (WHERE a.status = 'Hadir') as hadir,
            COUNT(e.id) as total_active
         FROM employees e
         LEFT JOIN attendances a ON e.id = a.employee_id AND a.date = $1
         WHERE e.status = true AND e.deleted_at IS NULL`,
    [today],
  );

  const row = result.rows[0];
  const hadir = parseInt(row.hadir || "0");
  const total = parseInt(row.total_active || "1");
  return {
    hadir,
    total_active: total,
    hadir_percent: total > 0 ? Math.round((hadir / total) * 100) : 0,
  };
}
