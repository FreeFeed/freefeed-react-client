export function centeredPopup(url, { name = 'popup', width = 500, height = 500 } = {}) {
  return window.open(
    url,
    name,
    [
      `height=${height}`,
      `width=${width}`,
      `top=${Math.round((screen.height - height) / 2.5)}`,
      `left=${Math.round((screen.width - width) / 2)}`,
    ].join(','),
  );
}

export function popupAsPromise(popup, { origins = [location.origin] } = {}) {
  return new Promise((resolve, reject) => {
    function listener(event) {
      if (event.source !== popup || !origins.includes(event.origin)) {
        return;
      }
      window.removeEventListener('message', listener, false);
      const { data } = event;
      if (data.error) {
        reject(new Error(data.error));
        return;
      }
      resolve(data);
    }

    window.addEventListener('message', listener, false);

    if (popup) {
      popup.focus();
    } else {
      reject(new Error('Could not open window'));
      window.removeEventListener('message', listener, false);
      return;
    }

    (function checkClose() {
      if (popup.closed) {
        // Do this reject just to be safe
        setTimeout(() => reject(new Error('Window was suddenly closed')), 250);
        return;
      }
      setTimeout(checkClose, 250);
    })();
  });
}

export function extAuthPopup() {
  const popup = centeredPopup(`about:blank`);
  popup.document.write('Loading...');
  popup.document.close();
  popup.document.title = 'Authorization window';
  return popup;
}
