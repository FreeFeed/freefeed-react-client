import cn from 'classnames';
import PropTypes from 'prop-types';
import styles from './code-block.module.scss';

/** @argument {{ text: string, className: [string] }} */
export default function CodeBlock({ text, className = '' }) {
  const clsName = cn(styles.codeBlock, className);

  return (
    <>
      <span className="p-break">
        <br /> <br />
      </span>
      <pre className={clsName}>
        <code>{text}</code>
      </pre>
      <span className="p-break">
        <br /> <br />
      </span>
    </>
  );
}

CodeBlock.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
};
