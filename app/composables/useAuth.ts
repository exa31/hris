import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
    const store = useAuthStore();
    const { user, permissions, isAuthenticated, loading, fetchInProgress, authModal } = storeToRefs(store);

    if (import.meta.client) {
        onMounted(() => {
            store.fetchUser();
        });
    }

    return {
        user,
        permissions,
        isAuthenticated,
        loading,
        fetchInProgress,
        authModal,
        fetchUser: store.fetchUser,
        hasPermission: store.hasPermission,
        login: store.login,
        logout: store.logout,
        handleModalConfirm: store.handleModalConfirm
    };
};
