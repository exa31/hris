import { verifyAccessToken } from '~~/server/utils/jwt'
import { sseEmitter } from '~~/server/utils/sse'

export default defineEventHandler(async (event) => {
    // 1. Get Token
    const authHeader = getHeader(event, 'authorization') ?? '';
    let token: string | null = null;
    
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
    }
    
    if (!token) {
        token = getCookie(event, 'access_token') ?? null;
    }
    
    if (!token) {
        setResponseStatus(event, 401);
        return { error: 'Unauthorized' };
    }
    
    let payload;
    try {
        payload = verifyAccessToken(token);
    } catch {
        setResponseStatus(event, 401);
        return { error: 'Invalid Token' };
    }
    
    const userId = payload.email; // user_id is stored in 'email' field based on setup
    const roleId = Number(payload.sub); // role_id is stored in 'sub' field based on setup

    // Provide SSE Headers
    setHeader(event, 'Content-Type', 'text/event-stream');
    setHeader(event, 'Cache-Control', 'no-cache');
    setHeader(event, 'Connection', 'keep-alive');
    
    // Flush headers to establish connection immediately
    event.node.res.flushHeaders();

    const sendEvent = (data: any) => {
        event.node.res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send connection success heartbeat
    sendEvent({ type: 'connected' });

    // Listener function for logout events
    const logoutListener = (targetUserId: any) => {
        if (String(targetUserId) === String(userId)) {
            sendEvent({ type: 'force_logout', reason: 'account_inactive' });
            event.node.res.end();
        }
    };

    // Listener for permission / role changes
    const updateListener = (targetUserId: any) => {
        if (String(targetUserId) === String(userId)) {
            sendEvent({ type: 'fetch_user' });
        }
    };

    const roleUpdateListener = (targetRoleId: any) => {
        if (Number(targetRoleId) === roleId) {
            sendEvent({ type: 'fetch_user' });
        }
    };

    sseEmitter.on('user_logout', logoutListener);
    sseEmitter.on('user_updated', updateListener);
    sseEmitter.on('role_updated', roleUpdateListener);

    // Lightweight heartbeat to prevent browser/proxy dropped connection
    const pingInterval = setInterval(() => {
        sendEvent({ type: 'ping' });
    }, 30000);

    // Clean up when client disconnects
    event.node.req.on('close', () => {
        clearInterval(pingInterval);
        sseEmitter.off('user_logout', logoutListener);
        sseEmitter.off('user_updated', updateListener);
        sseEmitter.off('role_updated', roleUpdateListener);
    });
});
