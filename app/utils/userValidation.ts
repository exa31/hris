/**
 * Password Utilities
 */

export interface PasswordValidation {
    isValid: boolean
    errors: string[]
    strength: 'weak' | 'medium' | 'strong'
}

/**
 * Validate password against rules
 * - Min 8 characters
 * - No spaces
 * - Min 1 uppercase
 * - Min 1 lowercase
 * - Min 1 special character
 */
export const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = []
    let strengthScore = 0

    if (!password) {
        return {
            isValid: false,
            errors: ['Password harus diisi'],
            strength: 'weak'
        }
    }

    // Check minimum length
    if (password.length < 8) {
        errors.push('Minimal 8 karakter')
    } else {
        strengthScore++
    }

    // Check for spaces
    if (password.includes(' ')) {
        errors.push('Tidak boleh ada spasi')
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
        errors.push('Minimal 1 huruf besar')
    } else {
        strengthScore++
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
        errors.push('Minimal 1 huruf kecil')
    } else {
        strengthScore++
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Minimal 1 karakter khusus (!@#$%^&* dll)')
    } else {
        strengthScore++
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    if (strengthScore >= 4) strength = 'strong'
    else if (strengthScore >= 2) strength = 'medium'

    return {
        isValid: errors.length === 0,
        errors,
        strength
    }
}

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
    if (!confirmPassword) {
        return { isValid: false, error: 'Konfirmasi password harus diisi' }
    }

    if (password !== confirmPassword) {
        return { isValid: false, error: 'Password tidak cocok' }
    }

    return { isValid: true }
}

/**
 * Generate random password
 */
export const generatePassword = (length: number = 12): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let password = ''
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    const allChars = uppercase + lowercase + numbers + special
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Username validation utility
 */

export interface UsernameValidation {
    isValid: boolean
    errors: string[]
}

/**
 * Validate username against rules
 * - Min 6 characters
 * - No spaces
 * - Only letters and numbers
 * - All lowercase
 */
export const validateUsername = (username: string): UsernameValidation => {
    const errors: string[] = []

    if (!username) {
        return { isValid: false, errors: ['Username harus diisi'] }
    }

    if (username.length < 6) {
        errors.push('Minimal 6 karakter')
    }

    if (username.includes(' ')) {
        errors.push('Tidak boleh ada spasi')
    }

    if (!/^[a-z0-9.]+$/.test(username)) {
        errors.push('Hanya huruf kecil, angka, dan titik (.)')
    }

    if (username !== username.toLowerCase()) {
        errors.push('Harus semua huruf kecil')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Hash password (dummy implementation)
 * TODO: Replace with proper bcrypt or similar
 */
export const hashPassword = (password: string): string => {
    // Simple hash for demo - replace with proper hashing
    return btoa(password)
}

/**
 * Verify password (dummy implementation)
 * TODO: Replace with proper bcrypt compare
 */
export const verifyPassword = (password: string, hash: string): boolean => {
    return btoa(password) === hash
}
