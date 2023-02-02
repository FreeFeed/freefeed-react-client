import cn from 'classnames';
import style from './dialog.module.scss';

export function Dialog({ className, children }) {
  return <section className={cn(style.container, className)}>{children}</section>;
}

export function DialogHeader({ children }) {
  return (
    <header className={style.header}>
      <h3>{children}</h3>
    </header>
  );
}

export function DialogBody({ children }) {
  return <main className={style.body}>{children}</main>;
}

export function DialogFooter({ children }) {
  return <footer className={style.footer}>{children}</footer>;
}
