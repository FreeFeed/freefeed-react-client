import React from 'react';

// Fieldset without styles. Can be used to disable block off controls.
export const FieldsetWrapper = ({ children, ...props }) => (
  <fieldset {...props} style={{ all: 'unset', display: 'block' }}>
    {children}
  </fieldset>
);
