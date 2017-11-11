import scrollTo from 'animated-scrollto';

const isEdge = window.navigator.userAgent.indexOf("Edge") > -1;
let rootElem;

if (isEdge) {
  rootElem = document.body;
} else {
  rootElem = document.documentElement;
}
const animatedScroll = (elem, duration, yPos) => {
  const y = window.pageYOffset + (yPos || elem.getBoundingClientRect().top);
  scrollTo(rootElem, y, duration);
};

export default animatedScroll;
