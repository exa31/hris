// Composable untuk handle authentication logic di client

import type { User, UserWithDetails } from "~/types/models";

export const useAuth = () => {
    const user = ref<UserWithDetails | null>(null);
    const isAuthenticated = computed(() => !!user.value);
    const loading = ref(false);

    // Fetch current user
    const fetchUser = async () => {
        try {
            loading.value = true;
            const { data } = await useFetch('/api/user');
            user.value = data.value;
        } catch (error) {
            user.value = null;
        } finally {
            loading.value = false;
        }
    };

    // Login
    const login = async (credential: string, password: string, rememberMe: boolean = false) => {
        try {
            loading.value = true;
            const { data, error } = await useFetch('/api/login', {
                method: 'POST',
                body: {
                    credential,
                    password,
                    rememberMe,
                },
            });

            if (error.value) {
                throw new Error(error.value.message);
            }

            user.value = data.value?.user;
            return data.value;
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
            await $fetch('/api/logout', { method: 'POST' });
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
