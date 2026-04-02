/**
 * Current User Profile Endpoint
 * GET /api/auth/me
 */

import { HttpError } from '~~/server/errors/HttpError'
import * as authService from '~~/server/services/auth.service'

export default withAuth(async (event) => {
    const userId = event.context.user?.id

    if (!userId) {
        throw new HttpError(401, 'UNAUTHORIZED', 'User not authenticated')
    }

    return await authService.getCurrentUserProfile(userId)
})
