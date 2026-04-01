// Composable untuk handle captcha logic

export const useCaptcha = () => {
    const captchaCode = ref<string>('');
    const userCaptcha = ref<string>('');
    const captchaError = ref<boolean>(false);

    // Generate random captcha code
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        captchaCode.value = result;
        userCaptcha.value = '';
        captchaError.value = false;
    };

    // Validate captcha
    const validateCaptcha = (): boolean => {
        const isValid = userCaptcha.value.toUpperCase() === captchaCode.value;
        captchaError.value = !isValid;

        if (!isValid) {
            // Generate new captcha jika salah
            generateCaptcha();
        }

        return isValid;
    };

    // Initialize captcha on mount
    onMounted(() => {
        generateCaptcha();
    });

    return {
        captchaCode,
        userCaptcha,
        captchaError,
        generateCaptcha,
        validateCaptcha,
    };
};
