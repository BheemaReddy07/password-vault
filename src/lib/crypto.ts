// Convert helpers
const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(buffer: ArrayBuffer | Uint8Array): string {
  // Handle both ArrayBuffer and Uint8Array by ensuring we get the underlying buffer
  const underlyingBuffer = buffer instanceof Uint8Array ? buffer.buffer : buffer;
  return btoa(String.fromCharCode(...new Uint8Array(underlyingBuffer)));
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// Generate a Data Encryption Key (DEK)
export async function generateDEK(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
}

// Import DEK into CryptoKey
export async function importKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    rawKey as BufferSource, // Type assertion to ensure BufferSource compatibility
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt any object
export async function encryptData(key: CryptoKey, data: object): Promise<{ iv: string; data: string }> {
  const iv: Uint8Array = crypto.getRandomValues(new Uint8Array(12)); // Explicit type
  const encoded = enc.encode(JSON.stringify(data));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource }, // Type assertion for iv
    key,
    encoded as BufferSource // Ensure encoded is treated as BufferSource
  );
  return {
    iv: toBase64(iv), // Now works because toBase64 handles Uint8Array
    data: toBase64(ct), // ct is ArrayBuffer, which is also handled
  };
}

// Decrypt
export async function decryptData(key: CryptoKey, data: string, iv: string): Promise<object> {
  const ct: Uint8Array = fromBase64(data); // Explicit type
  const ivArr: Uint8Array = fromBase64(iv); // Explicit type

  // Type assertion if TS still complains (safe because we know the shape)
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivArr as BufferSource },
    key,
    ct as BufferSource
  );

  return JSON.parse(dec.decode(plain));
}