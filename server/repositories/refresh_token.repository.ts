import type { PoolClient } from "pg";
import type { RefreshToken } from "~~/server/model/refresh_token.model";
import { HttpError } from "~~/server/errors/HttpError";

export const saveRefreshToken = async (client: PoolClient, { userId, tokenHash, expiresAt }: {
    userId: string,
    tokenHash: string,
    expiresAt: Date
}): Promise<boolean> => {
    const query = `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
    `;
    const values = [userId, tokenHash, expiresAt.toISOString()];

    const row = await client.query(query, values);

    return (row.rowCount || 0) > 0;
}

export const findByHash = async (client: PoolClient, tokenHash: string): Promise<RefreshToken | null> => {
    const query = `
        SELECT token, expires_at
        FROM refresh_tokens
        WHERE token = $1
          AND expires_at > NOW() LIMIT 1
    `;
    const values = [tokenHash];

    const res = await client.query<RefreshToken>(query, values);
    if (res.rows.length === 0) {
        throw new HttpError(401, 'INVALID_TOKEN', 'The provided token is invalid or has expired');
    }
    return res.rows[0] || null;
}

export const updateToken = async (client: PoolClient, newTokenHash: string, expiresAt: Date, oldTokenHash: string): Promise<boolean> => {
    const query = `
        UPDATE refresh_tokens
        SET token      = $1,
            expires_at = $2
        WHERE token = $3
    `

    const values = [newTokenHash, expiresAt.toISOString(), oldTokenHash];

    const res = await client.query(query, values);
    return (res.rowCount || 0) > 0;
}

export const deleteToken = async (client: PoolClient, tokenHash: string): Promise<boolean> => {
    const query = `
        DELETE
        FROM refresh_tokens
        WHERE token = $1
    `;

    const values = [tokenHash];

    const res = await client.query(query, values);
    return (res.rowCount || 0) > 0;
}