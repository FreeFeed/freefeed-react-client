const ARTIST_RE = /https?:\/\/music\.apple\.com\/([a-z]{2})\/artist\/([^/]+)\/(\d+).*/;
const ALBUM_RE = /https?:\/\/music\.apple\.com\/([a-z]{2})\/album\/([^/]+)\/(\d+).*/;
const SONG_RE = /https?:\/\/music\.apple\.com\/([a-z]{2})\/album\/([^/]+)\/(\d+)\?i=(\d+).*/;
const PLAYLIST_RE =
  /https?:\/\/music\.apple\.com\/([a-z]{2})\/playlist\/([^/]+)\/(pl\.\w+)\?l=en.*/;

export function canShowUrl(url) {
  return (
    url.match(ARTIST_RE) || url.match(ALBUM_RE) || url.match(SONG_RE) || url.match(PLAYLIST_RE)
  );
}

export default function AppleMusicPreview({ url }) {
  let src, height;

  if (url.match(ARTIST_RE)) {
    src = url.replace(ARTIST_RE, `https://embed.music.apple.com/$1/artist/$2/$3?l=en`);
    height = 450;
  } else if (url.match(SONG_RE)) {
    src = url.replace(SONG_RE, `https://embed.music.apple.com/$1/album/$2/$3?i=$4&l=en`);
    height = 150;
  } else if (url.match(ALBUM_RE)) {
    src = url.replace(ALBUM_RE, `https://embed.music.apple.com/$1/album/$2/$3?l=en`);
    height = 450;
  } else if (url.match(PLAYLIST_RE)) {
    src = url.replace(PLAYLIST_RE, `https://embed.music.apple.com/$1/playlist/$2/$3?l=en`);
    height = 450;
  } else {
    return false;
  }

  return (
    <div className="apple-music-preview link-preview-content">
      <iframe
        allow="autoplay *; encrypted-media *; fullscreen *"
        frameBorder="0"
        height={height}
        style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', background: 'transparent' }}
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        src={src}
      />
    </div>
  );
}
