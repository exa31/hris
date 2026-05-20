import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
    const modal = reactive({
        isOpen: false,
        title: '',
        message: '',
        type: 'primary' as 'primary' | 'danger' | 'warning' | 'success',
        action: null as Function | null
    });

    const showModal = (options: {
        title: string;
        message: string;
        type?: 'primary' | 'danger' | 'warning' | 'success';
        action?: Function | null;
    }) => {
        modal.isOpen = true;
        modal.title = options.title;
        modal.message = options.message;
        modal.type = options.type || 'primary';
        modal.action = options.action || null;
    };

    const showSuccess = (title: string, message: string, action?: Function | null) => {
        showModal({ title, message, type: 'success', action });
    };

    const showError = (title: string, message: string, action?: Function | null) => {
        showModal({ title, message, type: 'danger', action });
    };

    const showWarning = (title: string, message: string, action?: Function | null) => {
        showModal({ title, message, type: 'warning', action });
    };

    const showInfo = (title: string, message: string, action?: Function | null) => {
        showModal({ title, message, type: 'primary', action });
    };

    const handleConfirm = async () => {
        if (modal.action) {
            await modal.action();
        }
        modal.isOpen = false;
    };

    return {
        modal,
        showModal,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        handleConfirm
    };
});
