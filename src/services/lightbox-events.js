// Custom DOM events for communication between the lightbox and React components.
// The lightbox dispatches NEEDMORE when approaching the last slide,
// and listens for MOREITEMS with new slide data from the page component.
export const NEEDMORE_EVENT = 'lightbox:needmore';
export const MOREITEMS_EVENT = 'lightbox:moreitems';
