/**
 * Authentication Service
 * Handles user login, token generation, and session management
 */

import type { H3Event } from 'h3'
import type { PoolClient } from 'pg'
import { HttpError } from '~~/server/errors/HttpError'
import { withTransaction } from '~~/server/db/postgres'
import { useServerConfig } from '~~/server/utils/config'
import { signAccessToken, signRefreshToken, verifyRefreshToken, isRefreshTokenRotatingSoon } from '~~/server/utils/jwt'
import { hashToSha256, verifyPassword } from '~~/server/utils/hash'
import * as userRepository from '~~/server/repositories/user.repository'
import * as tokenRepository from '~~/server/repositories/refresh_token.repository'
import { logActivity } from '~~/server/services/activity-log.service'

const Config = useServerConfig()

interface LoginRequest {
    username: string
    password: string
    rememberMe?: boolean
}

interface LoginResponse {
    user: {
        id: number
        username: string
        employee_name: string
        role: string
    }
    accessToken: string
    refreshToken: string
}

/**
 * Login user with username and password
 * @param event - H3Event for setting cookies
 * @param loginData - Login credentials
 * @returns Login response with tokens
 */
export const login = async (event: H3Event, loginData: LoginRequest): Promise<LoginResponse> => {
    return withTransaction(async (client) => {
        const user = await userRepository.getUserByUsername(client, loginData.username)

        if (!user) {
            throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid username or password')
        }

        if (!user.is_active) {
            throw new HttpError(403, 'USER_INACTIVE', 'This user account is inactive')
        }

        const isPasswordValid = await verifyPassword(loginData.password, user.password_hash)
        if (!isPasswordValid) {
            throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid username or password')
        }

        // Generate tokens
        const accessToken = signAccessToken({
            userId: user.id,
            username: user.username,
            roleId: user.role_id,
            roleName: user.role_name || '',
            employeeId: user.employee_id,
            employeeName: user.employee_name,
            email: (user as any).employee_email || (user as any).email || null,
        })
        const { token: refreshToken, expiresAt } = signRefreshToken(String(user.id), user.username, user.employee_name || '')

        // Save refresh token to database
        await tokenRepository.saveRefreshToken(client, {
            userId: user.id.toString(),
            tokenHash: hashToSha256(refreshToken),
            expiresAt,
        })

        // Log Login
        await logActivity(client, {
            user_id: user.id,
            action: 'LOGIN',
            module: 'AUTH',
            description: `User ${user.username} berhasil login`,
            metadata: {
                user_agent: getHeader(event, 'user-agent'),
                ip: getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress
            }
        })

        const refreshTokenCookieOptions: any = {
            httpOnly: true,
            secure: Config.mode === 'production',
            sameSite: 'lax',
            path: '/api',
        }

        if (loginData.rememberMe) {
            refreshTokenCookieOptions.expires = expiresAt
        }

        setCookie(event, 'refresh_token', refreshToken, refreshTokenCookieOptions)
        setCookie(event, 'access_token', accessToken, {
            httpOnly: false,
            secure: Config.mode === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60,
        })

        return {
            user: {
                id: user.id,
                username: user.username,
                employee_name: user.employee_name || '',
                role: user.role_name || '',
            },
            accessToken,
            refreshToken,
        }
    })
}

/**
 * Refresh access token using refresh token
 * @param event - H3Event for setting cookies
 * @param refreshToken - Current refresh token
 * @returns New access token
 */
export const refreshAccessToken = async (event: H3Event, refreshToken: string): Promise<{ accessToken: string }> => {
    return withTransaction(async (client) => {
        const tokenPayload = verifyRefreshToken(refreshToken)

        if (!tokenPayload) {
            throw new HttpError(401, 'INVALID_TOKEN', 'Invalid or expired refresh token')
        }

        const storedToken = await tokenRepository.findByHash(client, hashToSha256(refreshToken))
        if (!storedToken) {
            throw new HttpError(401, 'INVALID_TOKEN', 'Token not found or has expired')
        }

        const user = await userRepository.getUserById(client, Number(tokenPayload.sub))
        if (!user || !user.is_active) {
            throw new HttpError(401, 'SESSION_EXPIRED', 'User account is inactive or not found')
        }

        if (isRefreshTokenRotatingSoon(new Date(storedToken.expires_at))) {
            const { token: newRefreshToken, expiresAt: newExpiresAt } = signRefreshToken(
                String(user.id),
                user.username,
                user.employee_name || ''
            )

            await tokenRepository.updateToken(client, hashToSha256(newRefreshToken), newExpiresAt, hashToSha256(refreshToken))

            setCookie(event, 'refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: Config.mode === 'production',
                sameSite: 'lax',
                path: '/api',
                expires: newExpiresAt,
            })
        }

        const newAccessToken = signAccessToken({
            userId: user.id,
            username: user.username,
            roleId: user.role_id,
            roleName: user.role_name || '',
            employeeId: user.employee_id,
            employeeName: user.employee_name,
            email: (user as any).employee_email || (user as any).email || null,
        })
        setCookie(event, 'access_token', newAccessToken, {
            httpOnly: false,
            secure: Config.mode === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60,
        })

        return { accessToken: newAccessToken }
    })
}

/**
 * Logout user - clear tokens
 * @param event - H3Event for clearing cookies
 * @param refreshToken - Refresh token to invalidate
 */
export const logout = async (event: H3Event, refreshToken?: string): Promise<void> => {
    if (refreshToken) {
        await withTransaction(async (client) => {
            const tokenPayload = verifyRefreshToken(refreshToken)
            if (tokenPayload) {
                const user = await userRepository.getUserById(client, Number(tokenPayload.sub))
                await logActivity(client, {
                    user_id: Number(tokenPayload.sub),
                    action: 'LOGOUT',
                    module: 'AUTH',
                    description: `User ${user?.username || user.employee_name} berhasil logout`,
                    metadata: {
                        user_agent: getHeader(event, 'user-agent'),
                        ip: getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress
                    }
                })
            }
        })
    }

    deleteCookie(event, 'access_token', { path: '/' })
    deleteCookie(event, 'refresh_token', { path: '/api' })
}

/**
 * Get current user profile
 * @param userId - User ID from auth context
 * @returns Formatted user profile with employee and role information
 */
export const getCurrentUserProfile = async (userId: number) => {
    return withTransaction(async (client) => {
        const user = await userRepository.getUserById(client, userId)

        if (!user) {
            throw new HttpError(404, 'USER_NOT_FOUND', 'User not found')
        }

        return {
            id: user.id,
            username: user.username,
            employee: {
                id: user.employee_id,
                name: user.employee_name,
                photo_url: user.employee_photo_url ?? null,
            },
            role: {
                id: user.role_id,
                name: user.role_name,
            },
            is_active: user.is_active,
        }
    })
}
