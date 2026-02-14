import { webcrypto } from "crypto";

const SALT = "libraria-salt";
const ITERATIONS = 100000;
const IV_LENGTH = 12;

async function deriveKey(
  secret: string,
  usage: KeyUsage[],
): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  return webcrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(SALT),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    usage,
  );
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns a base64-encoded string containing IV + ciphertext.
 */
export async function encrypt(
  plaintext: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const key = await deriveKey(secret, ["encrypt"]);
  const iv = webcrypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await webcrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return Buffer.from(combined).toString("base64");
}

/**
 * Decrypt a base64-encoded AES-256-GCM encrypted string.
 */
export async function decrypt(
  encrypted: string,
  secret: string,
): Promise<string> {
  const combined = Buffer.from(encrypted, "base64");
  const iv = combined.subarray(0, IV_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH);

  const key = await deriveKey(secret, ["decrypt"]);

  const decrypted = await webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(decrypted);
}
