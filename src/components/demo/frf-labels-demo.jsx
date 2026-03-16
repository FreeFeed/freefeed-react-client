/**
 * Demo: сравнение вариантов 2 и 3 отображения подписей ссылок на вложения FreeFeed.
 * Вариант 2: сокращаем только ссылки вне спойлера (те, у которых есть превью).
 * Вариант 3: сокращаем все FreeFeed-вложения, включая в спойлере.
 *
 * Открыть: /demo/frf-labels
 */
import PieceOfText from '../piece-of-text';
import { CommentMediaPreviews } from '../post/comment-media-previews';
import styles from './frf-labels-demo.module.scss';

const DEMO_COMMENT_TEXT = `Смотрите: https://stable-media.freefeed.net/attachments/550e8400-e29b-41d4-a716-446655440000

<spoiler>Первый спойлер: https://stable-media.freefeed.net/attachments/660e8400-e29b-41d4-a716-446655440001</spoiler>

Ещё снаружи: https://stable-media.freefeed.net/attachments/770e8400-e29b-41d4-a716-446655440002

<spoiler>Второй спойлер: https://stable-media.freefeed.net/attachments/880e8400-e29b-41d4-a716-446655440003 и https://stable-media.freefeed.net/attachments/990e8400-e29b-41d4-a716-446655440004</spoiler>

<spoiler>Третий спойлер: https://stable-media.freefeed.net/attachments/aa0e8400-e29b-41d4-a716-446655440005</spoiler>

Финальная снаружи: https://stable-media.freefeed.net/attachments/bb0e8400-e29b-41d4-a716-446655440006`;

export default function FrfLabelsDemo() {
  return (
    <div className={styles.demo}>
      <h1>Подписи ссылок на вложения FreeFeed</h1>
      <p className={styles.intro}>
        Один и тот же комментарий с картинками вне спойлера и внутри. Сравнение вариантов 2 и 3.
      </p>

      <div className={styles.compare}>
        <div className={styles.variant}>
          <h2>Вариант 2</h2>
          <p className={styles.desc}>
            Сокращаем только ссылки вне спойлера (те, у которых показывается превью). Внутри
            спойлера — длинный URL.
          </p>
          <div className={styles.comment}>
            <div className={styles.commentBody}>
              <PieceOfText
                text={DEMO_COMMENT_TEXT}
                isExpanded
                showMediaPreviews
                shortenInSpoiler={false}
              />
            </div>
            <CommentMediaPreviews text={DEMO_COMMENT_TEXT} />
          </div>
        </div>

        <div className={styles.variant}>
          <h2>Вариант 3</h2>
          <p className={styles.desc}>
            Сокращаем все FreeFeed-вложения. В спойлере — «frf-image» без нумерации для всех.
          </p>
          <div className={styles.comment}>
            <div className={styles.commentBody}>
              <PieceOfText
                text={DEMO_COMMENT_TEXT}
                isExpanded
                showMediaPreviews
                shortenInSpoiler={true}
              />
            </div>
            <CommentMediaPreviews text={DEMO_COMMENT_TEXT} />
          </div>
        </div>
      </div>
    </div>
  );
}
