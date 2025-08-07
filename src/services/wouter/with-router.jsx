import { parse as qsParse } from 'querystring';
import { useContext, useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import { routePropsContext } from './named-route-context';
import { routeStateContext } from './contexts';

export function useWouter() {
  const { name, path } = useContext(routePropsContext);
  const parentState = useContext(routeStateContext);
  const params = useParams();
  const [location, navigate] = useParsedLocation();

  return useMemo(
    () =>
      parentState
        ? parentState
        : {
            location,
            routeName: name,
            path,
            params,
            routes: [{ name, path, params }], // Loose compatibility with react-router
            navigate,
          },
    [location, name, navigate, params, parentState, path],
  );
}

export function withRouter(Component) {
  function Wrapper(props) {
    const router = useWouter();
    return <Component router={router} {...props} />;
  }
  Wrapper.displayName = `withRouter(${Component.displayName || Component.name || 'unnamed'})`;
  return Wrapper;
}

function useParsedLocation() {
  const [location, navigate] = useLocation();
  const parsed = useMemo(() => {
    let locString = location;

    const hashIndex = locString.indexOf('#');
    const hash = hashIndex === -1 ? '' : locString.slice(hashIndex);
    locString = hashIndex === -1 ? locString : locString.slice(0, hashIndex);

    const searchIndex = locString.indexOf('?');
    const search = searchIndex === -1 ? '' : locString.slice(searchIndex);
    const pathname = searchIndex === -1 ? locString : locString.slice(0, searchIndex);

    const query = search ? qsParse(search.slice(1)) : {};
    return { pathname, search, hash, query };
  }, [location]);
  return [parsed, navigate];
}
