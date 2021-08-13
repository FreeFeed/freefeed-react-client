import { useState } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

import logoPath from '../../assets/images/logo.svg';

import { Icon } from './fontawesome-icons';
import { SignInLink } from './sign-in-link';
import styles from './welcome.module.scss';

const LANGUAGES = [
  { id: 'en', label: 'In English' },
  { id: 'ru', label: 'По-русски' },
];

const WelcomePage = () => {
  const [lang, setLang] = useState(LANGUAGES[0].id);

  return (
    <div>
      <div className={styles.languages}>
        {LANGUAGES.map((l) => {
          const onClick = () => setLang(l.id);
          const cn = classnames(styles.lang, lang === l.id ? styles.active : false);
          return (
            // eslint-disable-next-line react/jsx-no-bind
            <span key={l.id} className={cn} onClick={onClick}>
              {l.label}
            </span>
          );
        })}
      </div>

      {lang === 'en' ? (
        <section className={styles.main}>
          <h3 className={styles.welcome}>
            Welcome to{' '}
            <strong className={styles.freefeed}>
              <img src={logoPath} alt="logo" aria-hidden="true" className={styles.logo} /> FreeFeed!
            </strong>
          </h3>

          <p className={styles.p}>
            FreeFeed is a small and free social network. We do not harvest users&apos; personal
            data, nor serve ads. It is an{' '}
            <a href="https://github.com/FreeFeed" target="_blank">
              open-source project
            </a>{' '}
            developed by volunteers and funded by donations from its users.
          </p>

          <div className={styles.actions}>
            <Link to="/signup" className={classnames(styles.signup, 'btn btn-lg btn-primary')}>
              Sign up!
            </Link>{' '}
            or <SignInLink className={styles.signin}>sign in</SignInLink>
          </div>

          <h4>No ads</h4>

          <p className={styles.p}>
            FreeFeed is backed and maintained by a non-profit organization. We do not show ads, we
            do not collect our users&apos; data, and we do not sell it.
          </p>

          <h4>No algorithms</h4>

          <p className={styles.p}>
            Your feed contains posts that your friends have written, liked, and/or commented on, as
            well as posts from groups you are subscribed to. There are no algorithms to curate your
            feed or promote popular users.
          </p>

          <h4>
            Private and personal <Icon icon={faHeart} className={styles.like} />
          </h4>

          <p className={styles.p}>
            FreeFeed is a service as well as a community. Its small scale lets us know each other
            better and become close friends. There is no &quot;real names&quot; policy. Your posts
            can be public, protected from search engines, or restricted to your subscribers.
          </p>
        </section>
      ) : (
        false
      )}

      {lang === 'ru' ? (
        <section className={styles.main}>
          <h3 className={styles.welcome}>
            Добро пожаловать во{' '}
            <strong className={styles.freefeed}>
              <img src={logoPath} alt="logo" aria-hidden="true" className={styles.logo} /> Фрифид!
            </strong>
          </h3>

          <p className={styles.p}>
            FreeFeed — маленькая бесплатная социальная сеть, которая не продаёт ваши данные и не
            показывает рекламу. Это{' '}
            <a href="https://github.com/FreeFeed" target="_blank">
              проект с открытым исходным кодом
            </a>
            . Его развитием занимаются пользователи-волонтеры за счет пожертвований других
            пользователей.
          </p>

          <div className={styles.actions}>
            <Link to="/signup" className={classnames(styles.signup, 'btn btn-lg btn-primary')}>
              Зарегистрируйтесь!
            </Link>{' '}
            или <SignInLink className={styles.signin}>войдите</SignInLink>
          </div>

          <h4>Без рекламы</h4>

          <p className={styles.p}>
            FreeFeed управляется некоммерческой организацией. Мы не размещаем рекламу, не собираем
            информацию о наших пользователях и никому её не продаём.
          </p>

          <h4>Без алгоритмов</h4>

          <p className={styles.p}>
            Ваша лента записей формируется просто: вы видите посты ваших друзей, посты
            пользователей, которые ваши друзья полайкали или прокомментировали, и посты из групп, на
            которые вы подписаны. Никаких сложных алгоритмов и подкапотной магии.
          </p>

          <h4>
            Приватность и безопасность <Icon icon={faHeart} className={styles.like} />
          </h4>

          <p className={styles.p}>
            FreeFeed — сервис и сообщество, небольшие размеры которого позволяют нам хорошо узнавать
            друг друга и общаться в кругу друзей. У нас нет политики “реальных имен”. Ваши посты
            могут быть публичными, закрытыми от поисковиков, или доступными только для ваших
            подписчиков.
          </p>
        </section>
      ) : (
        false
      )}
    </div>
  );
};

export default WelcomePage;
