/**
 * `Router` is the wrapper component that manage the routing
 *
 * Props:
 * - history (optional, defaults to createBrowserHistory()) the history object
 *   from 'history' package
 */
export { Router } from './components/router';

/*
 * `Route` checks the current location and renders the appropriate component if
 * it matches
 *
 * Props:
 * - path (optional) the pattern to match, see the 'regexparam' package for
 *   syntax. If not provided, the route matches any path.
 * - name (optional) route name. It isn't used by router, but can be used by
 *   application
 * - nest (optional, defaults to false) if true, the route matches only the
 *   prefix of the path and pass the rest of the path to the nested routes
 * - component (optional) the component to render if the route matches. The
 *   route children are rendered inside the component.
 * - children (optional) the children to render if the route matches. If both
 *   component and children are provided, the children are rendered inside the
 *   component.
 * - beforeEnter (optional) the function to call before the first match. This
 *   handler is guaranteed to be called before the component content is
 *   rendered. Handler may return a promise, in which case the route will wait.
 *   Arguments:
 *   - nextState: the router state, see `useNouter` hook
 * - beforeChange (optional) the function to call when the route state changes.
 *   This handler is guaranteed to be called before the component content is
 *   rendered with the new state. Handler may return a promise, in which case
 *   the route will wait. Arguments:
 *   - prevState: the previous router state, see `useNouter` hook
 *   - nextState: the router state, see `useNouter` hook
 * - onEnter (optional) alias for `beforeEnter`, for compatibility with
 *   react-router v3
 * - onChange (optional) alias for `beforeChange`, for compatibility with
 *   react-router v3
 */
export { Route } from './components/route';

/**
 * `Switch` renders the first child that matches. It doesn't required that all
 * children are `Route` components, but Switch will use they `path` prop to
 * check the match.
 */
export { Switch } from './components/switch';

/**
 * `Link` is the wrapper component for `<a>` (default) tag, which is used to
 * navigate between routes.
 *
 * Props:
 * - to (required) the path to navigate. It can be a string or an object with
 *   `pathname`, `search`, `hash`, and `query` props (all optional). The `query`
 *   prop is an object with query parameters, and it overrides the `search` prop
 *   if both are provided.
 * - as (optional, defaults to 'a') the tag to use for the link
 * - any other props are passed to the tag, including `onClick`
 */
export { Link } from './components/link';

/**
 * `useNouter` is a hook that returns the router state. It is an object with the
 * following properties:
 * - location:
 *   - pathname: the current location pathname
 *   - search: the current location search
 *   - hash: the current location hash
 *   - query: the parsed `search` string
 * - history: the history object that used by the router (can be used to
 *   navigate)
 * - name: the current route name
 * - pattern: the current route pattern
 * - params: the current params (the union of all params in current and parent
 *   routes)
 * - routes: the array of matched routes up to the current one: {name, pattern,
 *   params}[]
 * - path: the rest of the path after the current route
 */
export { useNouter } from './hooks';

/**
 * `withNouter` is a higher order component that wraps the component with the
 * `useNouter` hook. It adds the `router` prop with the router state.
 */
export { withNouter } from './hooks';

/**
 * `useResolvedRoutes` is a hook that returns the array of resolved routes.
 * While the `useNouter` hook returns the state of the current route, this hook
 * returns the state of all routes that were matched. It is a pretty advanced
 * feature and may be useful when you need to access the full state from the
 * top-level route. It returns an array of objects with the following
 * properties:
 * - id: the route internal id
 * - name: the route name
 * - pattern: the route pattern
 * - params: the route params
 *
 * This array is not a 'path' from the router root to the leaf, because there
 * can be multiple matched leaves in the route tree. Treat it as just a list of
 * all activated routes.
 */
export { useResolvedRoutes } from './hooks';
