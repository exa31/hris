import { verifyAccessToken } from '~~/server/utils/jwt'
import { HttpError } from '~~/server/errors/HttpError'
import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'
import { sendErrorResponse } from "~~/server/utils/response"

export function withAuth<T extends EventHandlerRequest = EventHandlerRequest, D = any>(
    handler?: EventHandler<T, D>
): EventHandler<T, D> {
    return defineEventHandler<T>(async (event: H3Event) => {
        try {
            // 1️⃣ Ambil token dari header
            const authHeader = getHeader(event, 'authorization') ?? ''
            let token: string | null = null

            if (!authHeader) {
                token = getCookie(event, 'token') || ''
                console.log('No Authorization header, trying cookie:', token)
            }

            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7).trim()
            }

            // 2️⃣ Fallback ke cookie
            if (!token) {
                token = getCookie(event, 'access_token') ?? null
            }

            if (!token) {
                return sendErrorResponse(event, 401, 'missing_token', 'Access token is missing')
            }

            // 3️⃣ Verify JWT
            let payload: any
            try {
                payload = verifyAccessToken(token)
            } catch {
                return sendErrorResponse(event, 401, 'invalid_token', 'Access token is invalid')
            }

            // 3.5 Check if user is still active in DB
            const { query: dbQuery } = await import('~~/server/db/postgres')
            
            const dbUser = await dbQuery('SELECT is_active FROM users WHERE id = $1', [payload.sub])
            if (dbUser.rows.length === 0 || !dbUser.rows[0].is_active) {
                return sendErrorResponse(event, 401, 'user_inactive', 'Akun Anda tidak aktif atau telah dihapus. Silakan hubungi admin.')
            }

            // 4️⃣ Attach ke context (SOURCE OF TRUTH)
            event.context.user = {
                id: payload.sub,
                email: payload.email,
                raw: payload,
            }

            // 5️⃣ Lanjut ke handler kalau ada
            if (handler) {
                return await handler(event)
            } else {
                return sendErrorResponse(
                    event,
                    500, 'no_handler',
                    'No handler provided for authenticated route'
                )
            }
        } catch (err: any) {
            console.error("[error]:", err)
            if (err instanceof HttpError) {
                return sendErrorResponse(event, err.status, err.code, err.message, err.data)
            }
            return sendErrorResponse(
                event,
                500, 'internal_error',
                'An internal server error occurred',
                err.data
            )
        }
    })
}
