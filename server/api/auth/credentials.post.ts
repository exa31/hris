import { HttpError } from '~~/server/errors/HttpError'
import { handleError } from '~~/server/utils/handleError'
import { login } from '~~/server/services/auth.service'
import { loginSchema } from '~~/server/model/user.model'
import { sendSuccess } from '~~/server/utils/response'
import z from 'zod'

export default handleError(async (event) => {
    const parsed = await readValidatedBody(event, (body) => loginSchema.safeParse(body))

    if (!parsed.success) {
        throw new HttpError(400, 'INVALID_REQUEST', 'Invalid request body', z.treeifyError(parsed.error).properties)
    }

    const data = await login(event, parsed.data)
    return sendSuccess(event, data, 'Login berhasil')
})
