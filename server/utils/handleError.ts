import {HttpError} from '~~/server/errors/HttpError'
import type {EventHandler, EventHandlerRequest, H3Event} from 'h3'

export const handleError = <T extends EventHandlerRequest, D>(
    handler?: EventHandler<T, D>
): EventHandler<T, D> => {
    return defineEventHandler<T>(async (event: H3Event) => {
        try {
            if (!handler) {
                return sendError(
                    event, 500, 'handler_not_implemented', 'Handler not implemented'
                )
            }
            return await handler(event)
        } catch (err: any) {
            console.error("[error]:", err)
            if (err instanceof HttpError) {
                return sendError(
                    event, err.status, err.code, err.message, err.data
                )
            }
            return sendError(
                event, 500, 'internal_error', 'An unexpected error occurred', err.data
            )
        }
    })
}
