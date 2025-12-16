import { HashtagSelector } from './hashtag-selector';
import { UsernameSelector } from './username-selector';

export function Selector({ queryType, ...rest }) {
  if (queryType === 'username') {
    return <UsernameSelector {...rest} />;
  } else if (queryType === 'hashtag') {
    return <HashtagSelector {...rest} />;
  }

  return null;
}
