export const withKey = (keyFromProps) => (Component) => (props) => (
  <Component key={keyFromProps(props)} {...props} />
);
