import { isLocalLink, parseText } from '../../utils/parse-text';
import ErrorBoundary from '../error-boundary';
import { T_YOUTUBE_VIDEO } from '../link-preview/video';
import { getMediaType, IMAGE, VIDEO } from '../media-links/helpers';
import { MediaLinkPreview } from '../media-links/media-link-preview';
import { MediaLinksProvider } from '../media-links/provider';
import styles from './comment-media-previews.module.scss';

export function CommentMediaPreviews({ text }) {
  const result = [];

  const tokens = text ? parseText(text) : [];

  let inSpoiler = false;
  for (const [index, token] of tokens.entries()) {
    if (token.type === 'SPOILER_START') {
      inSpoiler = true;
    } else if (token.type === 'SPOILER_END') {
      inSpoiler = false;
    } else if (token.type === 'LINK' && !inSpoiler) {
      if (
        !isLocalLink(token.text) &&
        /^https?:\/\//i.test(token.text) &&
        text.charAt(token.offset - 1) !== '!'
      ) {
        const type = getMediaType(token.text);
        if (type === IMAGE || type === VIDEO || type === T_YOUTUBE_VIDEO) {
          result.push(<MediaLinkPreview key={index} href={token.text} />);
        }
      }
    }
  }

  return (
    <div className={styles.previews}>
      <ErrorBoundary>
        <MediaLinksProvider>{result}</MediaLinksProvider>
      </ErrorBoundary>
    </div>
  );
}
