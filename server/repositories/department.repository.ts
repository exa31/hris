/**
 * Department Repository
 * Data access layer for department queries
 */

import type { PoolClient } from "pg";
import type {
  Department,
  CreateDepartmentInput,
} from "~~/server/model/department.model";

export async function getDepartments(
  client: PoolClient,
): Promise<Department[]> {
  const query = "SELECT id, name FROM departments ORDER BY name ASC";
  const result = await client.query<Department>(query);
  return result.rows;
}

export async function getDepartmentById(
  client: PoolClient,
  id: number,
): Promise<Department | null> {
  const query = "SELECT id, name FROM departments WHERE id = $1";
  const result = await client.query<Department>(query, [id]);
  return result.rows[0] || null;
}

export async function createDepartment(
  client: PoolClient,
  data: CreateDepartmentInput,
): Promise<Department> {
  const query = "INSERT INTO departments (name) VALUES ($1) RETURNING id, name";
  const result = await client.query<Department>(query, [data.name]);
  return result.rows[0];
}

export async function updateDepartment(
  client: PoolClient,
  id: number,
  data: CreateDepartmentInput,
): Promise<Department | null> {
  const query =
    "UPDATE departments SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name";
  const result = await client.query<Department>(query, [data.name, id]);
  return result.rows[0] || null;
}

export async function deleteDepartment(
  client: PoolClient,
  id: number,
): Promise<boolean> {
  const query = "DELETE FROM departments WHERE id = $1";
  const result = await client.query(query, [id]);
  return (result.rowCount ?? 0) > 0;
}
