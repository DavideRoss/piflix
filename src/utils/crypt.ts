import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export function uuid(byteLength: number): string {
    return crypto.randomBytes(byteLength).toString('base64');
}

export function hashPassword(password: string): string {
    let salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}