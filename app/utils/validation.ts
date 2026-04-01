// Validation utilities menggunakan Zod
import { z } from 'zod';

// Schema definitions
const usernameSchema = z.string()
    .trim()
    .min(3, 'Username minimal 3 karakter');

const emailSchema = z.string()
    .email('Format email tidak valid');

const phoneNumberSchema = z.string()
    .regex(/^(\+62|0)[0-9]{9,12}$/, 'Nomor HP tidak valid (format: 08xx atau +628xx)');

const passwordSchema = z.string()
    .min(8, 'Password minimal 8 karakter')
    .refine(pwd => /[A-Z]/.test(pwd), 'Password harus mengandung huruf besar')
    .refine(pwd => /[a-z]/.test(pwd), 'Password harus mengandung huruf kecil')
    .refine(pwd => /[0-9]/.test(pwd), 'Password harus mengandung angka')
    .refine(pwd => /[!@#$%^&*]/.test(pwd), 'Password harus mengandung karakter khusus (!@#$%^&*)');

const credentialSchema = z.string()
    .refine(
        cred => {
            try {
                usernameSchema.parse(cred);
                return true;
            } catch {
                try {
                    emailSchema.parse(cred);
                    return true;
                } catch {
                    try {
                        phoneNumberSchema.parse(cred);
                        return true;
                    } catch {
                        return false;
                    }
                }
            }
        },
        'Username/Email/No. HP tidak valid'
    );

// Validation functions
export const validateUsername = (username: string): boolean => {
    try {
        usernameSchema.parse(username);
        return true;
    } catch {
        return false;
    }
};

export const validateEmail = (email: string): boolean => {
    try {
        emailSchema.parse(email);
        return true;
    } catch {
        return false;
    }
};

export const validatePhoneNumber = (phone: string): boolean => {
    try {
        phoneNumberSchema.parse(phone.replace(/\s/g, ''));
        return true;
    } catch {
        return false;
    }
};

export const validateCredential = (credential: string): boolean => {
    try {
        credentialSchema.parse(credential);
        return true;
    } catch {
        return false;
    }
};

export const validatePassword = (password: string): string | null => {
    try {
        passwordSchema.parse(password);
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.issues[0]?.message || 'Password tidak valid';
        }
        return 'Password tidak valid';
    }
};

export const getCredentialType = (credential: string): 'username' | 'email' | 'phone' | null => {
    if (validateEmail(credential)) return 'email';
    if (validatePhoneNumber(credential)) return 'phone';
    if (validateUsername(credential)) return 'username';
    return null;
};

// Export schemas for reuse
export { usernameSchema, emailSchema, phoneNumberSchema, passwordSchema, credentialSchema };
