import crypto from 'crypto';

export const hashToSha256 = (input: string): string => {
    return crypto.createHash('sha256').update(input).digest('hex');
}

export const compareHash256 = async (input: string, hash: string): Promise<boolean> => {
    const inputHash = hashToSha256(input);
    return inputHash === hash;
}