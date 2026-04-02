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
        } catch (error) {
            user.value = null;
            permissions.value = [];
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
            return response.data;
        } catch (error: any) {
            throw error;
        } finally {
            loading.value = false;
        }
    };

    // Logout
    const logout = async () => {
        try {
            loading.value = true;
            await $axios.post('/api/auth/logout');
            user.value = null;
            permissions.value = [];
            navigateTo('/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            loading.value = false;
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
