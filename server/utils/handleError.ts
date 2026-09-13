import { HttpError } from '~~/server/errors/HttpError'
import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'
import { sendErrorResponse } from "~~/server/utils/response"

export function handleError<T extends EventHandlerRequest = EventHandlerRequest, D = any>(
    handler?: EventHandler<T, D>
): EventHandler<T, D> {
    return defineEventHandler<T>(async (event: H3Event) => {
        try {
            if (!handler) {
                return sendErrorResponse(
                    event, 500, 'handler_not_implemented', 'Handler not implemented'
                )
            }
            return await handler(event)
        } catch (err: any) {
            console.error("[error]:", err)
            if (err instanceof HttpError) {
                return sendErrorResponse(
                    event, err.status, err.code, err.message, err.data
                )
            }
            return sendErrorResponse(
                event, 500, 'internal_error', 'An unexpected error occurred', err.data
            )
        }
    })
}
