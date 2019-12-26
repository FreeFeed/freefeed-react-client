import { Children, useEffect, useMemo, useRef } from 'react';
import { withRouter } from 'react-router';

const getChildrenValue = (children) =>
  Children.map(children, (child) => child.props.value || '').join(';');

function LossPreventor(props) {
  const initialValue = useMemo(() => getChildrenValue(props.children), []);
  const childrenRef = useRef();
  childrenRef.current = props.children;

  useEffect(() => {
    const { router, routes } = props;
    router.setRouteLeaveHook(routes[routes.length - 1], () => {
      if (getChildrenValue(childrenRef.current) !== initialValue) {
        if (!confirm('Leave the page? Changes you made may not be saved.')) {
          return false;
        }
      }
    });
    return () => router.setRouteLeaveHook(routes[routes.length - 1], () => {});
  }, []);

  useEffect(() => {
    const reloadWatcher = (e) => {
      if (getChildrenValue(childrenRef.current) === initialValue) {
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
  }, []);

  return props.children;
}

export default withRouter(LossPreventor);
