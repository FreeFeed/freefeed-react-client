import { Children, useEffect, useMemo } from 'react';

const getChildrenValue = (children) =>
  Children.map(children, (child) => child.props.value || '').join(';');

function LossPreventor(props) {
  const initialValue = useMemo(() => getChildrenValue(props.children), []);

  useEffect(() => {
    const reloadWatcher = (e) => {
      if (getChildrenValue(props.children) === initialValue) {
        delete e.returnValue;
      } else {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', reloadWatcher);

    return () => {
      window.removeEventListener('beforeunload', reloadWatcher);
    };
  }, [props.children]);

  return props.children;
}

export default LossPreventor;
