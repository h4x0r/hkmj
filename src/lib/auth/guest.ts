export interface GuestSession {
  id: string;
  displayName: string;
  isGuest: true;
  createdAt: Date;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 20;

/**
 * Validate a display name for guest users
 */
export function validateDisplayName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: "Display name is required" };
  }

  if (trimmed.length < MIN_NAME_LENGTH) {
    return { valid: false, error: "Display name must be at least 2 characters" };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return { valid: false, error: "Display name must be at most 20 characters" };
  }

  return { valid: true };
}

/**
 * Generate a unique guest ID
 */
export function generateGuestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `guest_${timestamp}_${random}`;
}

/**
 * Create a guest session
 */
export function createGuestSession(displayName: string): GuestSession {
  const validation = validateDisplayName(displayName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return {
    id: generateGuestId(),
    displayName: displayName.trim(),
    isGuest: true,
    createdAt: new Date(),
  };
}
