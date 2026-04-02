/**
 * Logout Endpoint
 * Clears authentication tokens
 * POST /api/auth/logout
 */

import { handleError } from '~~/server/utils/handleError'
import { logout } from '~~/server/services/auth.service'
import { sendSuccess } from '~~/server/utils/response'
import { HttpError } from '~~/server/errors/HttpError'

export default handleError(async (event) => {
    const refreshToken = getCookie(event, 'refresh_token')

    if (!refreshToken) {
        throw new HttpError(401, 'UNAUTHORIZED', 'No refresh token found')
    }

    await logout(event, refreshToken)

    return sendSuccess(event)
})
