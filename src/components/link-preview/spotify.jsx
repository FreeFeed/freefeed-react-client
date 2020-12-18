const PLAYLIST_RE = /https:\/\/open.spotify.com(?:\/user\/\d+)?\/playlist\/([^?]*)(\?.*)?$/;
const TRACK_RE = /https:\/\/open.spotify.com\/track\/([^?]*)(\?.*)?$/;
const ALBUM_RE = /https:\/\/open.spotify.com\/album\/([^?]*)(\?.*)?$/;
const ARTIST_RE = /https:\/\/open.spotify.com\/artist\/([^?]*)(\?.*)?$/;
const EMBED_RE = /https:\/\/open.spotify.com\/embed\/.*$/;

export function canShowURL(url) {
  return (
    url.match(PLAYLIST_RE) ||
    url.match(TRACK_RE) ||
    url.match(ALBUM_RE) ||
    url.match(ARTIST_RE) ||
    url.match(EMBED_RE)
  );
}

export default function SpotifyPreview({ url }) {
  const embedUrl = do {
    if (url.match(PLAYLIST_RE)) {
      url.replace(PLAYLIST_RE, 'https://open.spotify.com/embed/playlist/$1');
    } else if (url.match(TRACK_RE)) {
      url.replace(TRACK_RE, 'https://open.spotify.com/embed/track/$1');
    } else if (url.match(ALBUM_RE)) {
      url.replace(ALBUM_RE, 'https://open.spotify.com/embed/album/$1');
    } else if (url.match(ARTIST_RE)) {
      url.replace(ARTIST_RE, 'https://open.spotify.com/embed/artist/$1');
    } else if (url.match(EMBED_RE)) {
      url;
    } else {
      return false;
    }
  };

  return (
    <div className="spotify-preview link-preview-content">
      <iframe
        src={embedUrl}
        allow="encrypted-media"
        frameBorder="0"
        scrolling="no"
        className="spotify-iframe"
        style={{ width: '100%', maxWidth: '450px', height: '380px' }}
      />
    </div>
  );
}
