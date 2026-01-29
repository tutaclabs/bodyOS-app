import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
export function randomToken(bytes = 48) {
    return crypto.randomBytes(bytes).toString('base64url');
}
