/* global CONFIG */
export default function formatInvitation(groupName) {
  if (!groupName) {
    return '';
  }
  return `I'd like to invite you to @${groupName} on ${CONFIG.siteTitle}. You can check it out here: ${window.location.origin}/${groupName}`;
}
