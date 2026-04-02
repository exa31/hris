/**
 * Refresh Token Endpoint
 * Generates new access token from refresh token
 * POST /api/auth/refresh
 */

import { HttpError } from '~~/server/errors/HttpError'
import { handleError } from '~~/server/utils/handleError'
import { refreshAccessToken } from '~~/server/services/auth.service'

export default handleError(async (event) => {
    const refreshToken = getCookie(event, 'refresh_token')

    if (!refreshToken) {
        throw new HttpError(401, 'NO_REFRESH_TOKEN', 'Refresh token is required')
    }

    return await refreshAccessToken(event, refreshToken)
})
