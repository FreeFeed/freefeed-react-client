/* global globalThis */

export function detectMobile({ userAgentData, userAgent } = { userAgentData: { mobile: false } }) {
  if (userAgentData) {
    return userAgentData.mobile;
  }
  // Intentionally rough detection
  return /iPhone|iPad|Android|Mobile|Tablet/.test(userAgent);
}

export const isMobile = detectMobile(globalThis.navigator);
