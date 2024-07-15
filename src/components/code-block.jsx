import cn from 'classnames';
import PropTypes from 'prop-types';
import styles from './code-block.module.scss';

/** @argument {{ text: string, className: [string] }} */
export default function CodeBlock({ text, className = '' }) {
  const clsName = cn(styles.codeBlock, className);

  const [, start, body, end] = /^([^\n]+)(.*?)([^\n]+)$/s.exec(text);

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
