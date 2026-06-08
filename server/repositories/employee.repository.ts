/**
 * Employee Repository
 * Data access layer for employee queries
 */

import type { PoolClient } from "pg";
import type { Employee } from "~~/server/model/employee.model";

/**
 * Get all employees with pagination and filtering
 */
export const getEmployees = async (
  client: PoolClient,
  options?: {
    limit?: number;
    offset?: number;
    search?: string;
    department_id?: number;
    status?: boolean;
    sortColumn?: string;
    sortDirection?: "asc" | "desc";
    position_ids?: number[];
    tenureOperator?: string;
    tenureValue?: number;
    type?: string;
  },
): Promise<{ rows: Employee[]; total: number }> => {
  let query = `
        SELECT e.*, 
               r.name as role_name,
               d.name as department_name,
               p.name as position_name
        FROM employees e
        LEFT JOIN users u ON e.id = u.employee_id
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
        WHERE e.deleted_at IS NULL
    `;
  let countQuery =
    "SELECT COUNT(*) as total FROM employees e LEFT JOIN users u ON e.id = u.employee_id LEFT JOIN roles r ON u.role_id = r.id LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN positions p ON e.position_id = p.id WHERE e.deleted_at IS NULL";
  const params: any[] = [];
  let paramCount = 1;

  // Filter by type
  if (options?.type) {
    const cond = ` AND e.type = $${paramCount}`;
    query += cond;
    countQuery += cond;
    params.push(options.type);
    paramCount++;
  }

  // Filter by status
  if (options?.status !== undefined) {
    const cond = ` AND e.status = $${paramCount}`;
    query += cond;
    countQuery += cond;
    params.push(options.status);
    paramCount++;
  }

  // Filter by department_id
  if (options?.department_id) {
    const cond = ` AND e.department_id = $${paramCount}`;
    query += cond;
    countQuery += cond;
    params.push(options.department_id);
    paramCount++;
  }

  // Filter by position_ids
  if (options?.position_ids && options.position_ids.length > 0) {
    const cond = ` AND e.position_id = ANY($${paramCount})`;
    query += cond;
    countQuery += cond;
    params.push(options.position_ids);
    paramCount++;
  }

  // Filter by tenure
  if (
    options?.tenureOperator &&
    options?.tenureValue !== undefined &&
    options?.tenureValue !== null
  ) {
    const operator =
      options.tenureOperator === ">" ||
      options.tenureOperator === "<" ||
      options.tenureOperator === "="
        ? options.tenureOperator
        : "=";
    const cond = ` AND EXTRACT(YEAR FROM age(CURRENT_DATE, e.join_date::date)) ${operator} $${paramCount}`;
    query += cond;
    countQuery += cond;
    params.push(options.tenureValue);
    paramCount++;
  }

  // Search by name, email, NIP, or joined names
  if (options?.search) {
    const cond = ` AND (e.name ILIKE $${paramCount} OR e.email ILIKE $${paramCount} OR e.nip::text ILIKE $${paramCount} OR p.name ILIKE $${paramCount} OR d.name ILIKE $${paramCount})`;
    query += cond;
    countQuery += cond;
    params.push(`%${options.search}%`);
    paramCount++;
  }

  // Get total count
  const countResult = await client.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);

  // Order
  const allowedSortColumns: Record<string, string> = {
    nip: "e.nip",
    name: "e.name",
    position: "p.name",
    department: "d.name",
    join_date: "e.join_date",
    created_at: "e.created_at",
  };

  let sortCol = "e.join_date";
  const mappedSortCol = options?.sortColumn
    ? allowedSortColumns[options.sortColumn]
    : undefined;
  if (mappedSortCol) {
    sortCol = mappedSortCol;
  }
  const sortDir = options?.sortDirection === "asc" ? "ASC" : "DESC";

  query += ` ORDER BY ${sortCol} ${sortDir}`;

  // Add pagination
  if (options?.limit) {
    query += ` LIMIT $${paramCount}`;
    params.push(options.limit);
    paramCount++;
  }

  if (options?.offset) {
    query += ` OFFSET $${paramCount}`;
    params.push(options.offset);
    paramCount++;
  }

  const result = await client.query(query, params);
  return { rows: result.rows, total };
};

/**
 * Get single employee by ID
 */
export const getEmployeeById = async (
  client: PoolClient,
  id: number,
): Promise<any | null> => {
  const query = `
        SELECT e.*, 
               ea.full_address, ea.district_id, 
               d_loc.name as "districtName", 
               r_loc.name as "regencyName", 
               p_loc.name as "provinceName",
               b.name as "birthCityName",
               dept.name as department_name,
               pos.name as position_name
        FROM employees e
        LEFT JOIN employee_addresses ea ON e.id = ea.employee_id
        LEFT JOIN districts d_loc ON ea.district_id = d_loc.id
        LEFT JOIN regencies r_loc ON d_loc.regency_id = r_loc.id
        LEFT JOIN provinces p_loc ON r_loc.province_id = p_loc.id
        LEFT JOIN regencies b ON e.birth_place_id = b.id
        LEFT JOIN departments dept ON e.department_id = dept.id
        LEFT JOIN positions pos ON e.position_id = pos.id
        WHERE e.id = $1 AND e.deleted_at IS NULL
    `;

  const result = await client.query(query, [id]);
  const employee = result.rows[0];

  if (!employee) return null;

  // Get educations (separated to avoid Cartesian product duplication)
  const educationsResult = await client.query(
    `
        SELECT e.id, e.name 
        FROM employee_educations ee
        JOIN educations e ON ee.education_id = e.id
        WHERE ee.employee_id = $1
    `,
    [id],
  );

  employee.educations = educationsResult.rows;

  return employee;
};

/**
 * Upsert employee address (insert or update)
 */
export const upsertEmployeeAddress = async (
  client: PoolClient,
  employeeId: number,
  district_id: number,
  full_address: string,
): Promise<void> => {
  const exist = await client.query(
    "SELECT id FROM employee_addresses WHERE employee_id = $1",
    [employeeId],
  );
  if (exist.rowCount && exist.rowCount > 0) {
    await client.query(
      "UPDATE employee_addresses SET district_id = $1, full_address = $2 WHERE employee_id = $3",
      [district_id, full_address, employeeId],
    );
  } else {
    await client.query(
      "INSERT INTO employee_addresses (employee_id, district_id, full_address) VALUES ($1, $2, $3)",
      [employeeId, district_id, full_address],
    );
  }
};

/**
 * Replace employee education links (delete + re-insert)
 */
export const syncEmployeeEducations = async (
  client: PoolClient,
  employeeId: number,
  educationIds: number[],
): Promise<void> => {
  await client.query(
    "DELETE FROM employee_educations WHERE employee_id = $1",
    [employeeId],
  );
  if (educationIds.length > 0) {
    const values = educationIds.map((_, idx) => `($1, $${idx + 2})`).join(",");
    await client.query(
      `INSERT INTO employee_educations (employee_id, education_id) VALUES ${values}`,
      [employeeId, ...educationIds],
    );
  }
};

/**
 * Create new employee
 */
export const createEmployee = async (
  client: PoolClient,
  data: any,
): Promise<any> => {
  const {
    district_id,
    full_address,
    educations,
    educationIds,
    ...employeeData
  } = data;

  const query = `
        INSERT INTO employees 
        (nip, name, email, phone, birth_date, marital_status, gender, children_count, join_date, position_id, department_id, status, type, birth_place_id, photo_url, distance_km)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
    `;

  const result = await client.query(query, [
    employeeData.nip,
    employeeData.name,
    employeeData.email,
    employeeData.phone,
    employeeData.birth_date,
    employeeData.marital_status,
    employeeData.gender,
    employeeData.children_count,
    employeeData.join_date,
    employeeData.position_id,
    employeeData.department_id,
    employeeData.status,
    employeeData.type,
    employeeData.birth_place_id,
    employeeData.photo_url,
    employeeData.distance_km,
  ]);

  const emp = result.rows[0];

  if (district_id && full_address) {
    await upsertEmployeeAddress(client, emp.id, district_id, full_address);
  }

  if (educationIds && Array.isArray(educationIds) && educationIds.length > 0) {
    await syncEmployeeEducations(client, emp.id, educationIds);
  }

  return emp;
};

/**
 * Update employee
 */
export const updateEmployee = async (
  client: PoolClient,
  id: number,
  data: any,
): Promise<any | null> => {
  const {
    district_id,
    full_address,
    educations,
    educationIds,
    id: _tempId,
    ...employeeData
  } = data;

  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  Object.entries(employeeData).forEach(([key, value]) => {
    if (value !== undefined) {
      updates.push(`${key} = $${paramCount}`);
      params.push(value);
      paramCount++;
    }
  });

  if (updates.length > 0) {
    params.push(id);
    const query = `
            UPDATE employees 
            SET ${updates.join(", ")}, updated_at = NOW()
            WHERE id = $${paramCount}
            RETURNING *
        `;
    await client.query(query, params);
  }

  if (district_id !== undefined && full_address !== undefined) {
    await upsertEmployeeAddress(client, id, district_id, full_address);
  }

  if (educationIds !== undefined && Array.isArray(educationIds)) {
    await syncEmployeeEducations(client, id, educationIds);
  }

  return getEmployeeById(client, id);
};

/**
 * Delete employee
 */
export const deleteEmployee = async (
  client: PoolClient,
  id: number,
): Promise<boolean> => {
  const result = await client.query(
    "UPDATE employees SET deleted_at = NOW(), status = false WHERE id = $1",
    [id],
  );
  return result.rowCount! > 0;
};

/**
 * Bulk update status
 */
export const bulkUpdateStatus = async (
  client: PoolClient,
  ids: number[],
  status: boolean,
): Promise<number> => {
  const query =
    "UPDATE employees SET status = $1, updated_at = NOW() WHERE id = ANY($2) RETURNING id";
  const result = await client.query(query, [status, ids]);
  return result.rowCount!;
};

/**
 * Bulk delete employees
 */
export const bulkDeleteEmployees = async (
  client: PoolClient,
  ids: number[],
): Promise<number> => {
  const query =
    "UPDATE employees SET deleted_at = NOW(), status = false WHERE id = ANY($1)";
  const result = await client.query(query, [ids]);
  return result.rowCount!;
};

/**
 * Get deleted employees
 */
export const getDeletedEmployees = async (
  client: PoolClient,
  options?: { limit?: number; offset?: number; search?: string },
): Promise<{ rows: any[]; total: number }> => {
  let query = `SELECT * FROM employees WHERE deleted_at IS NOT NULL`;
  let countQuery =
    "SELECT COUNT(*) as total FROM employees WHERE deleted_at IS NOT NULL";
  const params: any[] = [];
  let paramCount = 1;

  if (options?.search) {
    const cond = ` AND (name ILIKE $${paramCount} OR nip::text ILIKE $${paramCount})`;
    query += cond;
    countQuery += cond;
    params.push(`%${options.search}%`);
    paramCount++;
  }

  const { rows: countRows } = await client.query(countQuery, params);
  const total = parseInt(countRows[0].total);

  query += ` ORDER BY deleted_at DESC`;

  if (options?.limit) {
    query += ` LIMIT $${paramCount}`;
    params.push(options.limit);
    paramCount++;
  }
  if (options?.offset) {
    query += ` OFFSET $${paramCount}`;
    params.push(options.offset);
    paramCount++;
  }

  const { rows } = await client.query(query, params);
  return { rows, total };
};

/**
 * Restore deleted employee
 */
export const restoreEmployee = async (
  client: PoolClient,
  id: number,
): Promise<boolean> => {
  const query =
    "UPDATE employees SET deleted_at = NULL, status = true WHERE id = $1";
  const result = await client.query(query, [id]);
  return result.rowCount! > 0;
};

/**
 * Get dashboard status
 */
export const getDashboardStats = async (client: PoolClient) => {
  // Basic counts
  const countsResult = await client.query(`
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE type = 'Kontrak') as kontrak,
            COUNT(*) FILTER (WHERE type = 'Tetap') as tetap,
            COUNT(*) FILTER (WHERE type = 'Magang') as magang,
            COUNT(*) FILTER (WHERE gender = 'Male') as male,
            COUNT(*) FILTER (WHERE gender = 'Female') as female
        FROM employees
        WHERE status = true AND deleted_at IS NULL
    `);

  // Latest 5 employees
  const latestResult = await client.query(`
        SELECT e.id, e.name, e.email, e.join_date, e.type, p.name as position, d.name as department, e.photo_url
        FROM employees e
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.deleted_at IS NULL
        ORDER BY e.join_date DESC, e.id DESC
        LIMIT 5
    `);

  return {
    stats: {
      total: parseInt(countsResult.rows[0]?.total || "0"),
      kontrak: parseInt(countsResult.rows[0]?.kontrak || "0"),
      tetap: parseInt(countsResult.rows[0]?.tetap || "0"),
      magang: parseInt(countsResult.rows[0]?.magang || "0"),
      male: parseInt(countsResult.rows[0]?.male || "0"),
      female: parseInt(countsResult.rows[0]?.female || "0"),
    },
    latestEmployees: latestResult.rows,
  };
};

/**
 * Get detailed employee statistics
 */
export const getEmployeeStats = async (client: PoolClient) => {
  const query = `
        SELECT
            (SELECT COUNT(*) FROM employees WHERE deleted_at IS NULL) as total_talent,
            (SELECT COUNT(*) FROM employees WHERE status = true AND deleted_at IS NULL) as active_crew,
            (SELECT COUNT(*) FROM employees WHERE deleted_at IS NULL AND EXTRACT(MONTH FROM join_date) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM join_date) = EXTRACT(YEAR FROM CURRENT_DATE)) as new_talent,
            (SELECT COUNT(DISTINCT employee_id) FROM leave_requests WHERE status = 'Approved' AND CURRENT_DATE BETWEEN start_date AND end_date) as on_leave
    `;
  const result = await client.query(query);
  return {
    total_talent: parseInt(result.rows[0].total_talent),
    active_crew: parseInt(result.rows[0].active_crew),
    new_talent: parseInt(result.rows[0].new_talent),
    on_leave: parseInt(result.rows[0].on_leave),
  };
};

/**
 * Get 5 newest contract employees
 */
export const getNewContractEmployees = async (client: PoolClient) => {
  const result = await client.query(`
        SELECT e.id, e.name, e.email, e.join_date, e.type, 
               p.name as position_name, 
               d.name as department_name, 
               e.photo_url
        FROM employees e
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.type = 'Kontrak' AND e.status = true AND e.deleted_at IS NULL
        ORDER BY e.join_date DESC, e.id DESC
        LIMIT 5
    `);
  return result.rows;
};

/**
 * Check if any of these employees are superadmins
 */
export const checkSuperAdminByIds = async (
  client: PoolClient,
  ids: number[],
): Promise<any[]> => {
  const query = `
        SELECT e.id, e.name 
        FROM employees e
        JOIN users u ON e.id = u.employee_id 
        JOIN roles r ON u.role_id = r.id 
        WHERE e.id = ANY($1) AND LOWER(r.name) = 'superadmin' AND e.deleted_at IS NULL
    `;
  const { rows } = await client.query(query, [ids]);
  return rows;
};

/**
 * Check employees that still have active user accounts.
 */
export const checkEmployeesWithActiveUsers = async (
  client: PoolClient,
  ids: number[],
): Promise<any[]> => {
  const query = `
        SELECT e.id, e.name, u.id AS user_id, u.username
        FROM employees e
        JOIN users u ON e.id = u.employee_id
        WHERE e.id = ANY($1)
          AND e.deleted_at IS NULL
          AND u.deleted_at IS NULL
    `;
  const { rows } = await client.query(query, [ids]);
  return rows;
};

/**
 * Soft-delete user accounts linked to the provided employee IDs.
 */
export const softDeleteUsersByEmployeeIds = async (
  client: PoolClient,
  ids: number[],
): Promise<number[]> => {
  const query = `
        UPDATE users
        SET deleted_at = NOW(), is_active = false, updated_at = NOW()
        WHERE employee_id = ANY($1)
          AND deleted_at IS NULL
        RETURNING id
    `;
  const result = await client.query(query, [ids]);
  return result.rows.map((row: { id: number }) => row.id);
};
