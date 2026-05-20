/**
 * Position Repository
 * Data access layer for position/jabatan queries
 */

import type { PoolClient } from "pg";
import type {
  Position,
  CreatePositionInput,
} from "~~/server/model/position.model";

export async function getPositions(client: PoolClient): Promise<Position[]> {
  const query = "SELECT id, name FROM positions ORDER BY name ASC";
  const result = await client.query<Position>(query);
  return result.rows;
}

export async function getPositionById(
  client: PoolClient,
  id: number,
): Promise<Position | null> {
  const query = "SELECT id, name FROM positions WHERE id = $1";
  const result = await client.query<Position>(query, [id]);
  return result.rows[0] || null;
}

export async function createPosition(
  client: PoolClient,
  data: CreatePositionInput,
): Promise<Position> {
  const query = "INSERT INTO positions (name) VALUES ($1) RETURNING id, name";
  const result = await client.query<Position>(query, [data.name]);
  return result.rows[0];
}

export async function updatePosition(
  client: PoolClient,
  id: number,
  data: CreatePositionInput,
): Promise<Position | null> {
  const query =
    "UPDATE positions SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name";
  const result = await client.query<Position>(query, [data.name, id]);
  return result.rows[0] || null;
}

export async function deletePosition(
  client: PoolClient,
  id: number,
): Promise<boolean> {
  const query = "DELETE FROM positions WHERE id = $1";
  const result = await client.query(query, [id]);
  return (result.rowCount ?? 0) > 0;
}
