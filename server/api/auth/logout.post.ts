/**
 * Logout Endpoint
 * Clears authentication tokens
 * POST /api/auth/logout
 */

import { handleError } from '~~/server/utils/handleError'
import { logout } from '~~/server/services/auth.service'
import { sendSuccess } from '~~/server/utils/response'

export default handleError(async (event) => {
    const refreshToken = getCookie(event, 'refresh_token')

    await logout(event, refreshToken)

    return sendSuccess(event)
})
