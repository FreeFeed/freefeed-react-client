import { Children } from 'react';
import { useToc } from './context';

export function TokAnchor({ children }) {
  const [firstChild] = Children.toArray(children);
  const { register } = useToc();

  if (
    firstChild &&
    firstChild.type.charAt(0).toLowerCase() === firstChild.type.charAt(0) &&
    'id' in firstChild.props
  ) {
    register({
      id: firstChild.props.id,
      content: firstChild.props.children,
    });
  }

  return <>{children}</>;
}
