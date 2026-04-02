import { PoolClient } from 'pg'
import bcrypt from 'bcrypt'
import { HttpError } from '~~/server/errors/HttpError'
import * as userRepository from '~~/server/repositories/user.repository'
import type { CreateUserInput, UpdateUserInput, SearchUsersInput } from '~~/server/model/user.model'

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT || '10')

export async function getUsers(client: PoolClient, params: SearchUsersInput) {
    const { rows, total } = await userRepository.getUsers(client, params)
    return {
        users: rows,
        pagination: {
            total,
            limit: params.limit,
            offset: params.offset,
            pages: Math.ceil(total / params.limit)
        }
    }
}

export async function getUserById(client: PoolClient, id: number) {
    const user = await userRepository.getUserById(client, id)
    if (!user) {
        throw new HttpError(404, 'NOT_FOUND', 'User tidak ditemukan')
    }
    return user
}

export async function createUser(client: PoolClient, data: CreateUserInput) {
    // 1. Check if employee already has a user account
    const isTaken = await userRepository.isEmployeeAlreadyUser(client, data.employee_id)
    if (isTaken) {
        throw new HttpError(400, 'EMPLOYEE_ALREADY_USER', 'Pegawai ini sudah memiliki akun user')
    }

    // 2. Check username uniqueness
    const existingUser = await userRepository.getUserByUsername(client, data.username)
    if (existingUser) {
        throw new HttpError(400, 'USERNAME_TAKEN', 'Username sudah digunakan')
    }

    // 3. Hash password
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS)

    // 4. Create user
    return userRepository.createUser(client, {
        ...data,
        password_hash
    })
}

export async function updateUser(client: PoolClient, id: number, data: Partial<UpdateUserInput> & { password?: string }) {
    const user = await userRepository.getUserById(client, id)
    if (!user) {
        throw new HttpError(404, 'NOT_FOUND', 'User tidak ditemukan')
    }

    // Check username uniqueness if changing
    if (data.username && data.username.toLowerCase() !== user.username.toLowerCase()) {
        const existingUser = await userRepository.getUserByUsername(client, data.username)
        if (existingUser) {
            throw new HttpError(400, 'USERNAME_TAKEN', 'Username sudah digunakan')
        }
    }

    let password_hash: string | undefined
    if (data.password) {
        password_hash = await bcrypt.hash(data.password, SALT_ROUNDS)
    }

    return userRepository.updateUser(client, id, {
        ...data,
        password_hash
    })
}

export async function deleteUser(client: PoolClient, id: number) {
    const user = await userRepository.getUserById(client, id)
    if (!user) {
        throw new HttpError(404, 'NOT_FOUND', 'User tidak ditemukan')
    }
    return userRepository.deleteUser(client, id)
}

export async function getRoles(client: PoolClient) {
    return userRepository.getRoles(client)
}

export async function getPermissions(client: PoolClient) {
    return userRepository.getPermissions(client)
}

export async function updateRolePermissions(client: PoolClient, roleId: number, name: string, permissionIds: number[]) {
    return userRepository.updateRolePermissions(client, roleId, name, permissionIds)
}

export async function checkUsername(client: PoolClient, username: string, excludeId?: number) {
    const user = await userRepository.getUserByUsername(client, username)
    if (!user) return true
    if (excludeId && user.id === excludeId) return true
    return false
}

export async function searchEmployeesWithoutAccount(client: PoolClient, search: string) {
    return userRepository.searchEmployeesWithoutAccount(client, search)
}