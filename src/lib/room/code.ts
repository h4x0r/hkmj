// Characters that are easy to read (no 0, O, I, L)
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ123456789";
const CODE_LENGTH = 6;

/**
 * Generate a random room code
 */
export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CHARSET.length);
    code += CHARSET[randomIndex];
  }
  return code;
}

/**
 * Validate a room code format
 */
export function isValidRoomCode(code: string): boolean {
  if (!code || code.length !== CODE_LENGTH) {
    return false;
  }
  return /^[A-Z0-9]{6}$/.test(code);
}
