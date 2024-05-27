import cn from 'classnames';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './fontawesome-icons';
import { ButtonLink } from './button-link';
import style from './alternative-text.module.scss';

export function AlternativeText({
  status,
  icon,
  isError = false,
  inComment = false,
  close,
  children,
}) {
  return (
    <div className={cn(style.box, inComment && style.inComment)}>
      <div className={cn(style.status, isError && style.statusError)}>
        <span className={style.icon}>
          <Icon icon={icon} />
        </span>
        <span className={style.statusText}>{status}</span>
        <ButtonLink onClick={close} aria-label="Close" className={style.closeIcon}>
          <Icon icon={faTimes} />
        </ButtonLink>
      </div>
      <div>{children}</div>
    </div>
  );
}
