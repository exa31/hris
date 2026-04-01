import {Pool, type PoolClient, type QueryResult, type  QueryResultRow} from 'pg';
import {useAppConfig} from '~~/server/utils/config';
import {formatPgError} from "~~/server/utils/pgError";
import {HttpError} from "~~/server/errors/HttpError";

const Config = useAppConfig();

export type PostgresConfig = {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    ssl?: boolean | object;
};

let pool: Pool | null = null;

function buildPoolConfig(cfg?: Partial<PostgresConfig>) {
    const host = cfg?.host ?? Config.pgHost;
    const port = Number(cfg?.port ?? Config.pgPort);
    const user = cfg?.user ?? Config.pgUser;
    const password = cfg?.password ?? Config.pgPassword;
    const database = cfg?.database ?? Config.pgDatabase;
    const max = Number(cfg?.max ?? Config.pgMax);
    const idleTimeoutMillis = Number(cfg?.idleTimeoutMillis ?? Config.pgIdleTimeoutMs);
    const connectionTimeoutMillis = Number(cfg?.connectionTimeoutMillis ?? Config.pgConnectionTimeoutMs);

    const ssl = cfg?.ssl ?? (Config.pgSsl ? {rejectUnauthorized: false} : undefined);

    return {
        host,
        port,
        user,
        password,
        database,
        max,
        idleTimeoutMillis,
        connectionTimeoutMillis,
        ssl,
    } as any;
}

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export async function initPostgres(cfg?: Partial<PostgresConfig>, options?: {
    retries?: number;
    initialDelayMs?: number;
    factor?: number;
}): Promise<void> {
    if (pool) {
        return;
    }

    const poolConfig = buildPoolConfig(cfg);
    pool = new Pool(poolConfig);

    pool.on('error', (err: Error, _client: PoolClient) => {
        // Log an unexpected error on an idle client
        // Avoid printing credentials
        // eslint-disable-next-line no-console
        console.error('[postgres] unexpected error on idle client', {message: err.message});
    });

    const retries = options?.retries ?? 5;
    const initialDelayMs = options?.initialDelayMs ?? 200;
    const factor = options?.factor ?? 2;

    let attempt = 0;
    let lastErr: Error | null = null;

    while (attempt < retries) {
        try {
            const client = await pool.connect();
            client.release();
            // eslint-disable-next-line no-console
            console.info(`[postgres] connected to ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);
            return;
        } catch (err: any) {
            lastErr = err;
            attempt += 1;
            const wait = initialDelayMs * Math.pow(factor, attempt - 1);
            // eslint-disable-next-line no-console
            console.warn(`[postgres] connect attempt ${attempt} failed (${err?.message}). retrying in ${wait}ms`);
            await delay(wait);
        }
    }

    // If we are here, all attempts failed. Drain the pool and throw.
    try {
        await pool.end();
    } catch (_) {
        // ignore
    }
    pool = null;
    throw new Error(`[postgres] could not establish a connection after ${retries} attempts. last error: ${lastErr?.message}`);
}

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!pool) throw new Error('Postgres pool not initialized. Call initPostgres() first.');
    try {
        return pool.query<T>(text, params);
    } catch (err) {
        // Re-throw with some context but avoid leaking sensitive info
        const message = (err as Error).message ?? 'unknown error';
        throw new Error(`[postgres] query failed: ${message}`);
    }
}

export async function getClient(): Promise<PoolClient> {
    if (!pool) throw new Error('Postgres pool not initialized. Call initPostgres() first.');
    return pool.connect();
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!pool) throw new Error('Postgres pool not initialized. Call initPostgres() first.');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackErr) {
            // eslint-disable-next-line no-console
            console.error('[postgres] rollback failed', rollbackErr);
        }
        if (err instanceof HttpError) {
            throw err;
        }
        formatPgError(err);
    } finally {
        client.release();
    }
}

// executeInTransaction is an alias with a clearer name used by services
export const executeInTransaction = withTransaction;

export async function shutdownPostgres(timeoutMs = 5000): Promise<void> {
    if (!pool) return;
    const current = pool;
    pool = null;
    try {
        // pool.end() waits for clients to be released
        const p = current.end();
        if (timeoutMs > 0) {
            // race end() against a timeout
            await Promise.race([
                p,
                delay(timeoutMs).then(() => {
                    throw new Error('[postgres] shutdown timed out');
                }),
            ]);
        } else {
            await p;
        }
    } finally {
        // eslint-disable-next-line no-console
        console.info('[postgres] pool shut down');
    }
}

export {pool};
export type {PoolClient};
