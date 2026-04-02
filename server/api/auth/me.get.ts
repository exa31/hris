/**
 * Current User Profile Endpoint
 * GET /api/auth/me
 */

import { withAuth } from '~~/server/utils/withAuth'
import { sendSuccess } from '~~/server/utils/response'
import * as authService from '~~/server/services/auth.service'
import * as userService from '~~/server/services/user.service'
import { HttpError } from '~~/server/errors/HttpError'
import { withTransaction } from '~~/server/db/postgres'

export default withAuth(async (event) => {
    const userId = event.context.user?.id

    if (!userId) {
        throw new HttpError(401, 'UNAUTHORIZED', 'User not authenticated')
    }

    return withTransaction(async (client) => {
        const profile = await authService.getCurrentUserProfile(Number(userId))
        const permissions = await userService.getPermissionsByRoleId(client, profile.role.id)

        return sendSuccess(event, { ...profile, permissions })
    })
})
