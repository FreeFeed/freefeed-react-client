export default function formatInvitation(groupName) {
  if (!groupName) {
    return "";
  }
  return `I'd like to invite you to subscribe to "${groupName}" on Freefeed. You can check it out here: ${window.location.origin}/${groupName}`;
}
