import crypto from 'crypto';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

export const hashToSha256 = (input: string): string => {
    return crypto.createHash('sha256').update(input).digest('hex');
}

export const compareHash256 = async (input: string, hash: string): Promise<boolean> => {
    const inputHash = hashToSha256(input);
    return inputHash === hash;
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    // Use bcrypt for password verification
    return await bcrypt.compare(password, hash);
}

export const hashPassword = async (password: string): Promise<string> => {
    // Use bcrypt for password hashing
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
}