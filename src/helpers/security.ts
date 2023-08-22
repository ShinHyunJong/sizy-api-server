import { HASH_KEY } from '@src/constants/env';
import crypto from 'crypto';

/**
 * Hash data by SHA512 and Salt Key
 * @param key salt key
 * @param data data to be encrypted
 */
export const hash = (data: string): string => {
  return crypto.createHmac('sha512', HASH_KEY).update(data).digest('hex');
};
