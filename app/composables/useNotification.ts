import { storeToRefs } from 'pinia'
import { useNotificationStore } from '~/stores/notification'

export const useNotification = () => {
    const store = useNotificationStore();
    const { modal } = storeToRefs(store);

    return {
        notificationModal: modal,
        showNotification: store.showModal,
        showSuccess: store.showSuccess,
        showError: store.showError,
        showWarning: store.showWarning,
        showInfo: store.showInfo,
        handleNotificationConfirm: store.handleConfirm
    };
};
