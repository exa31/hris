import { withPermission } from '~~/server/utils/withPermission'
import { withTransaction } from '~~/server/db/postgres'
import * as userService from '~~/server/services/user.service'
import { sendSuccess } from '~~/server/utils/response'
import { updateUserSchema } from '~~/server/model/user.model'
import { HttpError } from '~~/server/errors/HttpError'
import * as userRepository from '~~/server/repositories/user.repository'
import z from 'zod'
import { logActivity } from '~~/server/services/activity-log.service'

import { sseEmitter } from '~~/server/utils/sse'

export default withPermission(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')
    const body = await readBody(event)

    if (!id) {
        throw new HttpError(400, 'INVALID_ID', 'ID user tidak valid')
    }

    const validation = updateUserSchema.safeParse({ ...body, id })

    if (!validation.success) {
        throw new HttpError(
            400,
            'INVALID_REQUEST',
            'Data user tidak valid',
            z.treeifyError(validation.error).properties
        )
    }

    return withTransaction(async (client) => {
        const currentUser = event.context.user
        const targetUser = await userService.getUserById(client, id)
        const userPermissions = await userService.getPermissionsByRoleId(client, currentUser.role_id)
        const hasFullUpdate = userPermissions.some(p => p.module === 'users' && p.action === 'update')

        // 1. Cek proteksi role
        if (validation.data.role_id !== undefined && validation.data.role_id !== targetUser.role_id) {
            // Hanya Super Admin yang boleh ganti role_id
            if (currentUser.role_id !== 1) {
                throw new HttpError(403, 'FORBIDDEN', 'Hanya Super Admin yang dapat mengubah role user')
            }

            // Jika target adalah Super Admin, cek apakah dia satu-satunya Super Admin aktif
            if (targetUser.role_id === 1) {
                const superAdminCount = await userRepository.countSuperAdmins(client)
                if (superAdminCount <= 1) {
                    throw new HttpError(403, 'FORBIDDEN', 'Gagal mengubah role. Harus ada minimal satu Super Admin yang aktif di sistem.')
                }
            }
        }

        // 2. Proteksi deaktifasi (is_active)
        if (validation.data.is_active === false && targetUser.role_id === 1) {
            const superAdminCount = await userRepository.countSuperAdmins(client)
            if (superAdminCount <= 1) {
                throw new HttpError(403, 'FORBIDDEN', 'Gagal menonaktifkan user. Super Admin terakhir tidak dapat dinonaktifkan.')
            }
        }

        // 3. Cakupan Update (Own Data vs Full)
        if (currentUser.role_id !== 1 && !hasFullUpdate) {
            if (id !== currentUser.id) {
                throw new HttpError(403, 'FORBIDDEN', 'Anda hanya dapat memperbarui data Anda sendiri')
            }
        }

        const data = await userService.updateUser(client, id, validation.data)
        
        // Log Activity
        await logActivity(client, {
            user_id: event.context.user.id,
            action: 'UPDATE',
            module: 'USER_MANAGEMENT',
            description: `Memperbarui data user: ${data.username}`,
            metadata: { target_user_id: data.id }
        })

        // Jika user dinonaktifkan atau diubah role-nya, tendang dari session
        if (validation.data.is_active === false) {
            sseEmitter.emit('user_logout', id);
        } else {
            // Beri tahu klien untuk memuat ulang permission/state-nya
            sseEmitter.emit('user_updated', id);
        }

        return sendSuccess(event, data, 'User berhasil diperbarui')
    })
}, [{ module: 'users', action: 'update' }])
