import { HttpError } from '~~/server/errors/HttpError'
import { handleError } from '~~/server/utils/handleError'
import { refreshAccessToken } from '~~/server/services/auth.service'
import { sendSuccess } from '~~/server/utils/response'

export default handleError(async (event) => {
    const refreshToken = getCookie(event, 'refresh_token')

    if (!refreshToken) {
        throw new HttpError(401, 'NO_REFRESH_TOKEN', 'Refresh token is required')
    }

    const data = await refreshAccessToken(event, refreshToken)
    return sendSuccess(event, data)
})
