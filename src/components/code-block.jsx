import cn from 'classnames';
import PropTypes from 'prop-types';
import styles from './code-block.module.scss';

/** @argument {{ text: string, className: [string] }} */
export default function CodeBlock({ text, className = '' }) {
  const clsName = cn(styles.codeBlock, className);

  const firstNewline = text.indexOf('\n');
  const lastNewline = text.lastIndexOf('\n');
  const start = text.slice(0, firstNewline);
  const body = text.slice(firstNewline, lastNewline + 1);
  const end = text.slice(lastNewline + 1);

  return (
    <>
      <span className="p-break">
        <br /> <br />
      </span>
      <pre className={clsName}>
        <code>
          <span className="code--backticks">{start}</span>
          {body}
          <span className="code--backticks">{end}</span>
        </code>
      </pre>
    </>
  );
}

CodeBlock.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};
