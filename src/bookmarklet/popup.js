const [siteOrigin] = /^\w+:\/\/[^/]+/.exec(document.currentScript.src);

let popupEl = null;
let iframeEl = null;
let overlayEl = null;

const cleaners = [];
const cleanUp = () => {
  let c;
  while ((c = cleaners.pop())) {
    c();
  }
};

window.bookmarklet_popupInit = () => {
  reCreateUI();

  // Event handlers for overlay
  let highlightedImage = null;
  const onMouseOverImage = ({ target }) => {
    if (!overlayEl || target.tagName !== 'IMG') {
      return;
    }
    highlightedImage = target;
    const imageRect = highlightedImage.getBoundingClientRect();
    overlayEl.style.left = `${window.scrollX + imageRect.left}px`;
    overlayEl.style.top = `${window.scrollY + imageRect.top}px`;
    overlayEl.style.width = `${imageRect.width - 10}px`;
    overlayEl.style.height = `${imageRect.height - 10}px`;
    overlayEl.style.display = 'block';
  };
  document.addEventListener('mouseover', onMouseOverImage);
  cleaners.push(() => document.removeEventListener('mouseover', onMouseOverImage));

  overlayEl.addEventListener('mouseleave', () => {
    overlayEl.style.display = 'none';
    highlightedImage = null;
  });
  overlayEl.addEventListener('click', () => highlightedImage && addImage(highlightedImage.src));

  // When the select2 inside iframe became multiline it change bookmarklet height, but we can't
  // handle this via CSS rules, so use JS to increase iframe size accordingly
  const onMessage = ({ origin, data: iframeHeight }) => {
    if (origin !== siteOrigin || !iframeHeight) {
      return;
    }
    // set iframeHeight to default value if the height less than default
    if (iframeHeight < 450) {
      iframeHeight = 450;
    }

    iframeEl.style.height = `${iframeHeight}px`;
    popupEl.style.height = `${iframeHeight}px`;
  };
  window.addEventListener('message', onMessage);
  cleaners.push(() => window.removeEventListener('message', onMessage));
};

// On first call
window.bookmarklet_popupInit();

function getSelectionText() {
  let text = '';
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != 'Control') {
    ({ text } = document.selection.createRange());
  }
  return text;
}

function addImage(url) {
  if (!iframeEl) {
    return;
  }
  let [path] = iframeEl.getAttribute('src').split('#');
  path = `${path}#${url}`;
  iframeEl.setAttribute('src', path);
}

function reCreateUI() {
  cleanUp();

  // Popup
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div style="' +
      'position: fixed;' +
      'z-index: 2000000000;' +
      'top: 0;' +
      'right: 15px;' +
      'height: 450px;' +
      'width: 450px;' +
      'box-sizing: content-box;' +
      'box-shadow: 0 0 10px #000;' +
      'border-bottom-right-radius: 10px;' +
      'border-bottom-left-radius: 10px;' +
      'background-color: #fff;' +
      '"/>',
  );
  popupEl = document.body.lastChild;
  cleaners.push(() => {
    popupEl.parentNode.removeChild(popupEl);
    popupEl = null;
  });

  // Iframe
  const url = encodeURIComponent(document.URL);
  const title = encodeURIComponent(document.title);
  const comment = encodeURIComponent(getSelectionText());
  popupEl.insertAdjacentHTML(
    'beforeend',
    `<iframe src="${siteOrigin}/bookmarklet?url=${url}&title=${title}&comment=${comment}" scrolling="auto" style="` +
      'position: absolute;' +
      'right: 0; top: 0; width: 450px; height: 440px;' +
      'border: 0; overlow: hidden;' +
      'border-bottom-right-radius: 6px;' +
      'border-bottom-left-radius: 6px;' +
      `"/>`,
  );
  iframeEl = popupEl.lastChild;
  cleaners.push(() => (iframeEl = null));

  // Close button for popup
  popupEl.insertAdjacentHTML(
    'beforeend',
    '<div style="' +
      'position: absolute;' +
      'right: 0;' +
      'top: 0;' +
      'cursor: pointer;' +
      'color: #777;' +
      'font-family: Helvetica, Arial, sans-serif;' +
      'font-size: 25px;' +
      'font-weight: 400;' +
      'line-height: 15px;' +
      'padding: 15px;' +
      '">&times;</div>',
  );
  popupEl.lastChild.addEventListener('click', cleanUp);

  // Overlay for images
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div style="display:none;border:5px solid #06f;position:absolute;overflow:hidden;cursor:pointer;text-align:center">' +
      '<div style="display:inline-block;background-color:#06f;font: normal 13px/21px Helvetica, Arial, sans-serif !important;color:#fff;padding:3px 11px 6px 11px;margin:0">' +
      'Select image' +
      '</div>' +
      '</div>',
  );
  overlayEl = document.body.lastChild;
  cleaners.push(() => {
    overlayEl.parentNode.removeChild(overlayEl);
    overlayEl = null;
  });
}
