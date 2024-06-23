export function getRankedNames(...namesSets) {
  const result = new Map();
  let rank = 1;
  for (const names of namesSets) {
    if (!names) {
      continue;
    }
    for (const name of names) {
      if (!result.has(name)) {
        result.set(name, rank);
      }
    }
    rank++;
  }
  return result;
}

export function getPostParticipants(post, state) {
  const result = new Set();
  // Author
  result.add(state.users[post.createdBy].username);
  // Addressees
  for (const feedId of post.postedTo) {
    const userId = state.subscriptions[feedId]?.user;
    const user = state.subscribers[userId] || state.users[userId];
    user && result.add(user.username);
  }
  // Comments
  for (const commentId of post.comments) {
    const userId = state.comments[commentId]?.createdBy;
    const user = state.users[userId]?.username;
    user && result.add(user);
  }
  return result;
}

export function getMyFriends(state) {
  const result = new Set();
  for (const userId of state.user.subscriptions) {
    const user = state.users[userId];
    user?.type === 'user' && result.add(user.username);
  }
  return result;
}

export function getMyGroups(state) {
  const result = new Set();
  for (const userId of state.user.subscriptions) {
    const user = state.users[userId];
    user?.type === 'group' && result.add(user.username);
  }
  return result;
}

export function getMySubscribers(state) {
  const result = new Set();
  for (const user of state.user.subscribers) {
    result.add(user.username);
  }
  return result;
}

export function getAllUsers(state) {
  const result = new Set();
  for (const user of Object.values(state.users)) {
    user?.type === 'user' && result.add(user.username);
  }
  return result;
}

export function getAllGroups(state) {
  const result = new Set();
  for (const user of Object.values(state.users)) {
    user?.type === 'group' && result.add(user.username);
  }
  return result;
}
