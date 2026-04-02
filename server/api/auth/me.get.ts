/**
 * Current User Profile Endpoint
 * GET /api/auth/me
 */

import { withAuth } from '~~/server/utils/withAuth'
import { sendSuccess } from '~~/server/utils/response'
import * as authService from '~~/server/services/auth.service'
import { HttpError } from '~~/server/errors/HttpError'

export default withAuth(async (event) => {
    const userId = event.context.user?.id

    if (!userId) {
        throw new HttpError(401, 'UNAUTHORIZED', 'User not authenticated')
    }

    const profile = await authService.getCurrentUserProfile(userId)
    return sendSuccess(event, profile)
})
