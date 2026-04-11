/**
 * Education Repository
 * Data access layer for education queries
 */

import type { PoolClient } from 'pg'

export interface Education {
    id: number
    name: string
}

export async function getEducations(client: PoolClient): Promise<Education[]> {
    const query = 'SELECT id, name FROM educations ORDER BY name ASC'
    const result = await client.query<Education>(query)
    return result.rows
}

export async function getEducationById(client: PoolClient, id: number): Promise<Education | null> {
    const query = 'SELECT id, name FROM educations WHERE id = $1'
    const result = await client.query<Education>(query, [id])
    return result.rows[0] || null
}

export async function createEducation(client: PoolClient, name: string): Promise<Education> {
    const query = 'INSERT INTO educations (name) VALUES ($1) RETURNING id, name'
    const result = await client.query<Education>(query, [name])
    return result.rows[0] as Education
}

export async function getEmployeeEducations(
    client: PoolClient,
    employeeId: number
): Promise<Education[]> {
    const query = `
    SELECT e.id, e.name 
    FROM educations e
    INNER JOIN employee_educations ee ON e.id = ee.education_id
    WHERE ee.employee_id = $1
    ORDER BY e.name ASC
  `
    const result = await client.query<Education>(query, [employeeId])
    return result.rows
}

export async function attachEducationToEmployee(
    client: PoolClient,
    employeeId: number,
    educationId: number
): Promise<void> {
    // Check if already attached
    const checkQuery = `
    SELECT id FROM employee_educations 
    WHERE employee_id = $1 AND education_id = $2
  `
    const checkResult = await client.query(checkQuery, [employeeId, educationId])

    if (checkResult.rows.length === 0) {
        const insertQuery = `
      INSERT INTO employee_educations (employee_id, education_id)
      VALUES ($1, $2)
    `
        await client.query(insertQuery, [employeeId, educationId])
    }
}

export async function detachEducationFromEmployee(
    client: PoolClient,
    employeeId: number,
    educationId: number
): Promise<void> {
    const query = `
    DELETE FROM employee_educations
    WHERE employee_id = $1 AND education_id = $2
  `
    await client.query(query, [employeeId, educationId])
}

export async function isEducationInUse(client: PoolClient, educationId: number): Promise<boolean> {
    const query = 'SELECT 1 FROM employee_educations WHERE education_id = $1 LIMIT 1'
    const result = await client.query(query, [educationId])
    return (result.rowCount ?? 0) > 0
}

export async function deleteEducation(client: PoolClient, educationId: number): Promise<void> {
    const query = 'DELETE FROM educations WHERE id = $1'
    await client.query(query, [educationId])
}
