import { Children, useMemo } from 'react';
import classNames from 'classnames';

import '../../styles/shared/invisible-select.scss';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './fontawesome-icons';

export function InvisibleSelect({ children, value, className, withCaret = false, ...rest }) {
  const selectedLabel = useMemo(() => {
    const optProps = Children.toArray(children)
      .filter((c) => c.type === 'option')
      .map((c) => c.props);

    for (const o of optProps) {
      if (value === o.value) {
        return o.children;
      }
    }
    return optProps[0].children;
  }, [children, value]);

  return (
    <div
      className={classNames(
        'invisibleSelect',
        className,
        withCaret && 'invisibleSelect--withCaret',
      )}
    >
      <div className="invisibleSelect__label">
        {selectedLabel}
        {withCaret && <Icon icon={faCaretDown} className="invisibleSelect__caret" />}
      </div>
      <select value={value} className="invisibleSelect__select" {...rest}>
        {children}
      </select>
    </div>
  );
}
