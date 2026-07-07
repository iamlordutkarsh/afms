import bcrypt from "bcryptjs";
import crypto from "crypto";

const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** A readable random password (no ambiguous chars like 0/O/l/1). */
export function randomPassword(len = 10): string {
  const bytes = crypto.randomBytes(len);
  return Array.from(bytes).map((b) => ALPHABET[b % ALPHABET.length]).join("");
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
