export const FieldsetWrapper = ({ children, ...props }) => (
  <fieldset {...props} style={{ all: 'unset', display: 'block' }}>
    {children}
  </fieldset>
);
