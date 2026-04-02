import { useAppConfig } from '~~/server/utils/config';
import { withTransaction } from "~~/server/db/postgres";
import { HttpError } from "~~/server/errors/HttpError";
import { isRefreshTokenRotatingSoon, signAccessToken, signRefreshToken, verifyRefreshToken } from "~~/server/utils/jwt";
import * as repository from "~~/server/repositories/refresh_token.repository";
import { hashToSha256 } from "~~/server/utils/hash";
import type { H3Event } from "h3";
import { sendSuccess } from "~~/server/utils/response";

const Config = useAppConfig();

export const refreshToken = async (event: H3Event, oldRefreshToken: string) => {
    return withTransaction(
        async (client) => {
            // verify refresh token
            const { sub: userId, name, email } = verifyRefreshToken(oldRefreshToken);

            const isActiveRefreshToken = await repository.findByHash(client, hashToSha256(oldRefreshToken));

            if (!isActiveRefreshToken) {
                throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
            }

            const refreshTokenNeedRotation = isRefreshTokenRotatingSoon(new Date(new Date(isActiveRefreshToken.expires_at)));

            const accessToken = signAccessToken(name, email, userId!);

            if (!refreshTokenNeedRotation) {

                setCookie(
                    event,
                    'access_token',
                    accessToken,
                    {
                        httpOnly: true,
                        secure: Config.mode === 'production',
                        sameSite: 'lax',
                        path: '/api',
                        expires: new Date(isActiveRefreshToken.expires_at),
                    }
                )

                return sendSuccess(event, {
                    access_token: accessToken,
                    refresh_token: oldRefreshToken,
                    refresh_expires_at: new Date(isActiveRefreshToken.expires_at),
                }, "Token refreshed successfully", "TOKEN_REFRESHED", 200);
            }

            const {
                token: newRefreshToken,
                expiresAt
            } = signRefreshToken(userId!, name, email);

            await repository.updateToken(client, hashToSha256(oldRefreshToken), expiresAt, hashToSha256(newRefreshToken));

            setCookie(
                event,
                'refresh_token',
                newRefreshToken,
                {
                    httpOnly: true,
                    secure: Config.mode === 'production',
                    sameSite: 'lax',
                    path: '/api',
                    expires: expiresAt,
                }
            )

            setCookie(
                event,
                'access_token',
                accessToken,
                {
                    httpOnly: true,
                    secure: Config.mode === 'production',
                    sameSite: 'lax',
                    path: '/api',
                    expires: expiresAt,
                }
            )

            return sendSuccess(event, {
                access_token: accessToken,
                refresh_token: newRefreshToken,
                refresh_expires_at: expiresAt,
            }, "Token refreshed successfully", "TOKEN_REFRESHED", 200);
        }
    )
}