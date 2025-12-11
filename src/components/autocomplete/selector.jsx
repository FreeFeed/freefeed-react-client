import { UsernameSelector } from './username-selector';

export function Selector({ queryType, ...rest }) {
  if (queryType === 'username') {
    return <UsernameSelector {...rest} />;
  }

  return null;
}
