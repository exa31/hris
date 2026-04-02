import type { PoolClient } from 'pg'

export const searchDistricts = async (client: PoolClient, keyword: string) => {
    const sql = `
        SELECT 
            d.id, 
            d.name,
            r.name as regency,
            p.name as province
        FROM districts d
        JOIN regencies r ON d.regency_id = r.id
        JOIN provinces p ON r.province_id = p.id
        WHERE d.name ILIKE $1
        LIMIT 20
    `
    const result = await client.query(sql, [`%${keyword}%`])
    return result.rows
}

export const searchRegencies = async (client: PoolClient, keyword: string) => {
    const sql = `
        SELECT 
            r.id, 
            r.name,
            p.name as province
        FROM regencies r
        JOIN provinces p ON r.province_id = p.id
        WHERE r.name ILIKE $1
        LIMIT 20
    `
    const result = await client.query(sql, [`%${keyword}%`])
    return result.rows
}
