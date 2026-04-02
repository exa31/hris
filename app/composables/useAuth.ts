// Composable untuk handle authentication logic di client

import type { UserWithDetails } from "~/types/models";

export interface UserPermission {
    module: string
    action: string
    name: string
}

export const useAuth = () => {
    const user = ref<UserWithDetails | null>(null);
    const permissions = ref<UserPermission[]>([]);
    const isAuthenticated = computed(() => !!user.value);
    const loading = ref(false);
    const $axios = useNuxtApp().$axios;

    // Fetch current user
    const fetchUser = async () => {
        try {
            loading.value = true;
            const response = await $axios.get('/api/auth/me');
            user.value = response.data;
            permissions.value = response.data?.permissions || [];
            
            // Start connection if authenticated
            if (user.value) initSSE();
        } catch (error) {
            user.value = null;
            permissions.value = [];
            closeSSE();
        } finally {
            loading.value = false;
        }
    };

    // Check if user has a specific permission
    const hasPermission = (module: string, action: string): boolean => {
        // Superadmin bypass (Case insensitive and handles "Superadmin" or "Super Admin")
        const roleName = user.value?.role?.name?.toLowerCase().replace(/\s/g, '') || '';
        if (roleName === 'superadmin') {
            return true;
        }

        return permissions.value.some(p => 
            p.module?.toLowerCase() === module?.toLowerCase() && 
            p.action?.toLowerCase() === action?.toLowerCase()
        )
    }


    // Login
    const login = async (username: string, password: string, rememberMe: boolean = false) => {
        try {
            loading.value = true;
            const response = await $axios.post('/api/auth/credentials', {
                username,
                password,
                rememberMe,
            });

            user.value = response.data?.user;
            initSSE();
            return response.data;
        } catch (error: any) {
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Logout
    const logout = async (silent: boolean = false) => {
        try {
            loading.value = true;
            if (!silent) {
                await $axios.post('/api/auth/logout');
            }
            user.value = null;
            permissions.value = [];
            closeSSE();
            navigateTo('/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            loading.value = false;
        }
    };

    // SSE Management
    const initSSE = () => {
        if (import.meta.client) {
            closeSSE(); // close any existing connection first
            
            // Note: withCredentials is required to send cookies if the auth is cookie-based
            const eventSource = new EventSource('/api/auth/stream', { withCredentials: true });
            
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'force_logout') {
                        // User inactivated or session revoked
                        alert('Sesi Anda telah berakhir atau akun dinonaktifkan.');
                        logout(true); // silent logout locally
                    }
                } catch (e) {
                    console.error('SSE Error parsing data:', e);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE Connection Error:', error);
                // Optionally handle retries or let EventSource auto-reconnect
            };

            // Store onto window to avoid multiple composable instances spawning multiple SSEs
            (window as any)._authSSE = eventSource;
        }
    };

    const closeSSE = () => {
        if (import.meta.client && (window as any)._authSSE) {
            (window as any)._authSSE.close();
            (window as any)._authSSE = null;
        }
    };


    // Initialize on mount
    onMounted(() => {
        fetchUser();
    });

    return {
        user: readonly(user),
        permissions: readonly(permissions),
        isAuthenticated,
        loading: readonly(loading),
        login,
        logout,
        fetchUser,
        hasPermission,
    };
};
