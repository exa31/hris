import { defineStore } from 'pinia'
import type { UserWithDetails } from "~/types/models"
import { getErrorMessageAxios } from '~/utils/handleError'

export interface UserPermission {
    module: string
    action: string
    name: string
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<UserWithDetails | null>(null);
    const permissions = ref<UserPermission[]>([]);
    const isAuthenticated = computed(() => !!user.value);
    const loading = ref(false);
    const fetchInProgress = ref(false);
    const $axios = useNuxtApp().$axios;

    const authModal = reactive({
        isOpen: false,
        title: '',
        message: '',
        type: 'primary' as 'primary' | 'danger' | 'warning' | 'success',
        action: '' as 'logout' | 'redirect' | ''
    });

    const initSSE = () => {
        if (import.meta.client) {
            closeSSE(); // close any existing connection first
            const eventSource = new EventSource('/api/auth/stream', { withCredentials: true });

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'force_logout') {
                        authModal.isOpen = true;
                        authModal.title = 'Sesi Berakhir';
                        authModal.message = 'Sesi Anda telah berakhir atau akun dinonaktifkan oleh Admin.';
                        authModal.type = 'danger';
                        authModal.action = 'logout';
                    } else if (data.type === 'fetch_user') {
                        console.log('[SSE] Mendapatkan instruksi refresh permission/data user.');
                        fetchUser(true);
                        authModal.isOpen = true;
                        authModal.title = 'Hak Akses Diperbarui';
                        authModal.message = 'Hak akses akun Anda telah diperbarui. Lanjutkan ke halaman utama.';
                        authModal.type = 'info' as any;
                        authModal.action = 'redirect';
                    }
                } catch (e) {
                    console.error('SSE Error parsing data:', e);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE Connection Error:', error);
            };

            (window as any)._authSSE = eventSource;
        }
    };

    const handleModalConfirm = () => {
        authModal.isOpen = false;
        if (authModal.action === 'logout') {
            logout(true);
        } else if (authModal.action === 'redirect') {
            navigateTo('/dashboard');
        }
    };

    const closeSSE = () => {
        if (import.meta.client && (window as any)._authSSE) {
            (window as any)._authSSE.close();
            (window as any)._authSSE = null;
        }
    };

    // Fetch current user
    const fetchUser = async (force = false) => {
        if (!force && (user.value || fetchInProgress.value)) {
            if (user.value && import.meta.client && !(window as any)._authSSE) {
                initSSE();
            }
            return;
        }

        try {
            fetchInProgress.value = true;
            loading.value = true;
            const response = await $axios.get('/api/auth/me');
            const res = response.data?.data || response.data;
            user.value = res;
            permissions.value = res?.permissions || [];

            // Start connection if authenticated
            if (user.value) initSSE();
        } catch (error) {
            user.value = null;
            permissions.value = [];
            closeSSE();
            console.error('Fetch user error:', getErrorMessageAxios(error));
        } finally {
            loading.value = false;
            fetchInProgress.value = false;
        }
    };

    // Check if user has a specific permission
    const hasPermission = (module: string, action: string): boolean => {
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
            fetchUser(true);
            return response.data;
        } catch (error: any) {
            throw new Error(getErrorMessageAxios(error));
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
            console.error('Logout error:', getErrorMessageAxios(error));
        } finally {
            loading.value = false;
        }
    };

    return {
        user,
        permissions,
        isAuthenticated,
        loading,
        authModal,
        fetchInProgress,
        fetchUser,
        hasPermission,
        login,
        logout,
        handleModalConfirm
    }
})
