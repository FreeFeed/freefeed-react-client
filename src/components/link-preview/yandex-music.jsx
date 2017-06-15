import React from 'react';

const YM_TRACK_RE = /^https?:\/\/music\.yandex\.ru\/album\/(\d+)\/track\/(\d+)/;
const YM_ALBUM_RE = /^https?:\/\/music\.yandex\.ru\/album\/(\d+)$/;

export function canShowURL(url) {
  return YM_TRACK_RE.test(url) || YM_ALBUM_RE.test(url);
}

export default class YandexMusicPreview extends React.Component {
  render() {
    const {url} = this.props;
    let m = YM_TRACK_RE.exec(url);
    if (m !== null) {
      return (
        <iframe
          frameBorder="0"
          width="100%" height="100"
          style={{border: "none", width: "100%", height: "100px"}}
          src={`https://music.yandex.ru/iframe/#track/${m[2]}/${m[1]}/`}
          className="yandex-music-preview link-preview-content"
        />
      );
    }
    m = YM_ALBUM_RE.exec(url);
    if (m !== null) {
      return (
        <iframe
          frameBorder="0"
          width="100%" height="280"
          style={{border: "none", width: "100%", height: "280px"}}
          src={`https://music.yandex.ru/iframe/#album/${m[1]}/`}
          className="yandex-music-preview link-preview-content"
        />
      );
    }
    return null;
  }
}
