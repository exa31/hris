// Composable untuk handle authentication logic di client

import type { User, UserWithDetails } from "~/types/models";

export const useAuth = () => {
    const user = ref<UserWithDetails | null>(null);
    const isAuthenticated = computed(() => !!user.value);
    const loading = ref(false);
    const $axios = useNuxtApp().$axios;

    // Fetch current user
    const fetchUser = async () => {
        try {
            loading.value = true;
            const response = await $axios.get('/api/auth/me');
            user.value = response.data;
        } catch (error) {
            user.value = null;
        } finally {
            loading.value = false;
        }
    };

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
        isAuthenticated,
        loading: readonly(loading),
        login,
        logout,
        fetchUser,
    };
};
