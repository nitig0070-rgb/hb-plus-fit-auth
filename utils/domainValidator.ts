/**
 * Company Email Domain Restriction Configuration
 * Exclusively allows employees with '@hbplus.fit' email addresses.
 */

export const ALLOWED_DOMAIN = (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit')
  .toLowerCase()
  .replace(/^@/, '');

export const DOMAIN_RESTRICTION_ERROR_MESSAGE =
  'Access restricted. Please login using your official domain email.';

/**
 * Validates if the given email belongs to the permitted corporate domain.
 * @param email - The email string to validate
 * @returns boolean - true if email is valid and ends with @hbplus.fit
 */
export function isAuthorizedDomain(email?: string | null): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const domainPattern = new RegExp(`@${ALLOWED_DOMAIN.replace('.', '\\.')}$`, 'i');

  return domainPattern.test(normalizedEmail);
}

/**
 * Extracts the domain part of an email address.
 * @param email - The email address
 * @returns string or null
 */
export function extractEmailDomain(email?: string | null): string | null {
  if (!email || typeof email !== 'string') return null;
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}
