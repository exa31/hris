class Cookie {

    static set(name: string, value: string, days: number) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = date.toUTCString();
        const isProduction = process.env.NODE_ENV === 'production';
        const secure = isProduction ? ';Secure' : '';
        document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax${secure}`;
    }

    static get(name: string) {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c!.charAt(0) === ' ') c = c!.substring(1, c!.length);
            if (c!.indexOf(nameEQ) === 0) return c!.substring(nameEQ.length, c!.length);
        }
        return null;
    }

    static erase(name: string) {
        document.cookie = `${name}=; Max-Age=-99999999;path=/;SameSite=Lax`;
    }
}

export default Cookie;