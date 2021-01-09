/**
 * Detects if cookies supported
 */
export function cookiesEnabled() {
  try {
    // Create cookie
    document.cookie = 'cookietest=1';
    const ret = document.cookie.includes('cookietest=');
    // Delete cookie
    document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    return ret;
  } catch {
    return false;
  }
}
