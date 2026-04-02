import { verifyAccessToken } from '~~/server/utils/jwt'
import { HttpError } from '~~/server/errors/HttpError'
import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'
import { sendError } from "~~/server/utils/response";

export const withPermission = <T extends EventHandlerRequest, D>(
    handler?: EventHandler<T, D>,
    requiredPermissions: {
        module: string,
        action: string
    }[] = []
): EventHandler<T, D> => {
    return defineEventHandler<T>(async (event: H3Event) => {
        try {
            // 1️⃣ Ambil token dari header / cookie
            const authHeader = getHeader(event, 'authorization') ?? ''
            let token: string | null = null

            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7).trim()
            }

            if (!token) {
                token = getCookie(event, 'access_token') ?? null
            }

            if (!token) {
                return sendError(event, 401, 'missing_token', 'Access token is missing')
            }

            // 2️⃣ Verify JWT
            let payload: any
            try {
                payload = verifyAccessToken(token)
            } catch {
                return sendError(event, 401, 'invalid_token', 'Access token is invalid')
            }

            // payload.sub = role_id, payload.email = user_id (see auth.service.ts: signAccessToken(username, userId, roleId))
            const roleId = Number(payload.sub)
            const userId = payload.email // user_id stored in 'email' field

            // 3️⃣ Cek user masih aktif
            const { query: dbQuery } = await import('~~/server/db/postgres')
            const dbUser = await dbQuery('SELECT is_active FROM users WHERE id = $1', [userId])
            if (dbUser.rows.length === 0 || !dbUser.rows[0].is_active) {
                return sendError(event, 401, 'user_inactive', 'Akun Anda tidak aktif atau telah dihapus.')
            }

            // 4️⃣ Attach user ke context
            event.context.user = {
                id: userId,
                role_id: roleId,
                raw: payload,
            }

            // 5️⃣ Cek permission jika ada yang diwajibkan (Bypass untuk role_id 1 / Superadmin)
            if (requiredPermissions.length > 0 && roleId !== 1) {
                const permResult = await dbQuery(
                    `SELECT p.module, p.action
                     FROM permissions p
                     INNER JOIN role_permissions rp ON p.id = rp.permission_id
                     WHERE rp.role_id = $1`,
                    [roleId]
                )

                const userPermissions: { module: string; action: string }[] = permResult.rows

                for (const required of requiredPermissions) {
                    const hasPermission = userPermissions.some(
                        p => p.module === required.module && p.action === required.action
                    )
                    if (!hasPermission) {
                        return sendError(
                            event,
                            403,
                            'forbidden',
                            `Akses ditolak: Anda tidak memiliki izin '${required.action}' pada modul '${required.module}'`
                        )
                    }
                }
            }

            // 6️⃣ Lanjut ke handler
            if (handler) {
                return await handler(event)
            } else {
                return sendError(event, 500, 'no_handler', 'No handler provided')
            }

        } catch (err: any) {
            console.error("[withPermission error]:", err)
            if (err instanceof HttpError) {
                return sendError(event, err.status, err.code, err.message, err.data)
            }
            return sendError(event, 500, 'internal_error', 'An internal server error occurred')
        }
    })
}
