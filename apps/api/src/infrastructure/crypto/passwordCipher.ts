/**
 * Cifrado/descifrado de contraseñas con AES-256-CBC (módulo `crypto` nativo de Node).
 *
 * Formato almacenado: "<iv_hex>:<ciphertext_hex>"
 *
 * La clave de 32 bytes se toma de la variable de entorno CIPHER_KEY.
 * En desarrollo se usa una clave por defecto; en producción CIPHER_KEY debe
 * ser un secreto de 64 caracteres hexadecimales (32 bytes).
 *
 * ¿Por qué AES-256-CBC y no bcrypt?
 * El requerimiento pide poder LEER la contraseña original (descifrar), lo que
 * implica cifrado reversible. bcrypt es un hash unidireccional y no permite
 * recuperar el valor original, por eso se eligió AES-256-CBC.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // bytes

function getKey(): Buffer {
  const hex =
    process.env.CIPHER_KEY ??
    "4572704d6967726174696f6e44656661756c744b657932303236212121212121"; // 32 bytes dev
  return Buffer.from(hex, "hex");
}

/** Cifra una contraseña en texto plano → "<iv_hex>:<ciphertext_hex>" */
export function encryptPassword(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/** Descifra "<iv_hex>:<ciphertext_hex>" → contraseña en texto plano */
export function decryptPassword(stored: string): string {
  const [ivHex, cipherHex] = stored.split(":");
  if (!ivHex || !cipherHex) throw new Error("Formato de contraseña inválido");
  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(cipherHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8",
  );
}

/** Verifica si un texto plano coincide con la contraseña almacenada cifrada. */
export function verifyPassword(plaintext: string, stored: string): boolean {
  try {
    return decryptPassword(stored) === plaintext;
  } catch {
    return false;
  }
}
