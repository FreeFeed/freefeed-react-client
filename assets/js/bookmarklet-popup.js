function bookmarklet_unload() {
  jQuery('#bookmarklet_popup').remove();
  jQuery('#bookmarklet_overlay').remove();
  bookmarklet_unbind();
}

function bookmarklet_unbind() {
  jQuery(document).off('.bookmarklet');
}

function bookmarklet_upload(url) {
  var frame = jQuery('#bookmarklet_frame');
  var path = frame.attr('src').split('#')[0];
  path = path + '#' + url;
  frame.attr('src', path);
}

function bookmarklet_getSelectionText() {
  var text = '';
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != 'Control') {
    text = document.selection.createRange().text;
  }
  return text;
}

function bookmarklet_popupInit(host) {
  bookmarklet_unload();

  // Popup
  jQuery('<div id="bookmarklet_popup" />').appendTo('body');
  jQuery('#bookmarklet_popup').css({
    position: 'fixed', 'z-index': 2000000000,
    top: 0, right: '15px',
    height: '450px', width: '450px',
    'box-sizing': 'content-box',
    'box-shadow': '0 0 10px #000',
    'border-bottom-right-radius': '10px', 'border-bottom-left-radius': '10px',
    'background-color': '#fff'
  });

  // Iframe
  var url = encodeURIComponent(document.URL);
  var title = encodeURIComponent(document.title);
  var comment = encodeURIComponent(bookmarklet_getSelectionText());
  jQuery('<iframe name="bookmarklet_frame" id="bookmarklet_frame" src="' + host + '/bookmarklet?url=' + url + '&title=' + title + '&comment=' + comment + '" scrolling="auto"/>')
    .appendTo('#bookmarklet_popup')
    .css({
      position: 'absolute',
      right: 0, top: 0, width: '450px', height: '440px',
      border: 0, overlow: 'hidden',
      'border-bottom-right-radius': '6px', 'border-bottom-left-radius': '6px'
    });

  // Close button for popup
  jQuery('<div id="bookmarklet_close">&times;</div>').appendTo('#bookmarklet_popup')
    .css({
      position: 'absolute', right: 0, top: 0, cursor: 'pointer', color: '#777',
      'font-family': 'Helvetica, Arial, sans-serif', 'font-size': '25px',
      'font-weight': 400, 'line-height': '15px', padding: '15px'
    })
    .click(function() {
      bookmarklet_unload();
    });

  // Overlay for images
  jQuery('<div id="bookmarklet_overlay" style="display:none;border:5px solid #06f;position:absolute;overflow:hidden;cursor:pointer;text-align:center">'
    + '<div id="bookmarklet_title" style="display:inline-block;background-color:#06f;font: normal 13px/21px Helvetica, Arial, sans-serif !important;color:#fff;padding:3px 11px 6px 11px;margin:0">Select image</div>'
    + '</div>')
    .appendTo('body');

  // Event handlers for overlay
  var highlightedImage;
  jQuery(document)
    .on('mouseenter.bookmarklet', 'img', function() {
      highlightedImage = jQuery(this);
      var offset = highlightedImage.offset();
      jQuery('#bookmarklet_overlay')
        .css({left: offset.left, top: offset.top})
        .width(jQuery(highlightedImage).outerWidth() - 10)
        .height(jQuery(highlightedImage).outerHeight() - 10)
        .show();
    });
  jQuery('#bookmarklet_overlay')
    .on('mouseleave', function() {
      jQuery('#bookmarklet_overlay').hide();
    })
    .on('click', function() {
      var url = jQuery(highlightedImage)[0].href || jQuery(highlightedImage)[0].src;
      bookmarklet_upload(url);
    });

  // When the select2 inside iframe became multiline it change bookmarklet height, but we can't
  // handle this via CSS rules, so use JS to increase iframe size accordingly
  jQuery(window).on('message', function(event) {
    var iframeHeight = event.originalEvent.data;
    if (iframeHeight) {
      jQuery('#bookmarklet_popup').height(iframeHeight);
      jQuery('#bookmarklet_frame').height(iframeHeight);
    }
  });
}