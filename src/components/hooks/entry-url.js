import { useSelector } from 'react-redux';

// Returns entry (post) URL by its id
export function useEntryUrl(id) {
  const urlName = useSelector((state) => {
    const post = state.posts[id];

    const recipients = post.postedTo
      .map((subscriptionId) => {
        const userId = (state.subscriptions[subscriptionId] || {}).user;
        const subscriptionType = (state.subscriptions[subscriptionId] || {}).name;
        const isDirectToSelf = userId === post.createdBy && subscriptionType === 'Directs';
        return !isDirectToSelf ? userId : false;
      })
      .map((userId) => state.subscribers[userId])
      .filter(Boolean);

    if (recipients.length > 0 && !recipients.some((r) => r.type === 'user')) {
      return recipients[0].username;
    }

    return state.users[post.createdBy].username;
  });

  return `/${encodeURIComponent(urlName)}/${encodeURIComponent(id)}`;
}
