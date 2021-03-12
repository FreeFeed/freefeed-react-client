import { Link } from 'react-router';

export default () => (
  <div className="box-body">
    <h3>Welcome to FreeFeed!</h3>

    <p>
      FreeFeed is a small and free social network. We do not harvest users&apos; personal data, nor
      serve ads. It is an{' '}
      <a href="https://github.com/FreeFeed" rel="noopener">
        open-source project
      </a>{' '}
      developed by volunteers and funded by donations from its users.
    </p>

    <h4>No ads</h4>

    <p>
      FreeFeed is backed and maintained by a non-profit organization. We do not show ads, we do not
      collect our users&apos; data, and we do not sell it.
    </p>

    <h4>No algorithms</h4>

    <p>
      Your feed contains posts that your friends have written, liked, and/or commented on, as well
      as posts from groups you are subscribed to. There are no algorithms to curate your feed or
      promote popular users.
    </p>

    <h4>Private and personal</h4>

    <p>
      FreeFeed is a service as well as a community. Its small scale lets us know each other better
      and become close friends. There is no &quot;real names&quot; policy. Your posts can be public,
      protected from search engines, or restricted to your subscribers.
    </p>

    <p>
      <b>
        <Link to="/signup" className="inline-header">
          Sign up
        </Link>
      </b>{' '}
      now or{' '}
      <Link to="/signin" className="inline-header">
        sign in
      </Link>
    </p>

    <h3>Добро пожаловать во Фрифид!</h3>

    <p>
      FreeFeed — маленькая бесплатная социальная сеть, которая не продаёт ваши данные и не
      показывает рекламу. Это{' '}
      <a href="https://github.com/FreeFeed" rel="noopener">
        проект с открытым исходным кодом
      </a>
      . Его развитием занимаются пользователи-волонтеры за счет пожертвований других пользователей.
    </p>

    <h4>Без рекламы</h4>

    <p>
      FreeFeed управляется некоммерческой организацией. Мы не размещаем рекламу, не собираем
      информацию о наших пользователях и никому её не продаём.
    </p>

    <h4>Без алгоритмов</h4>

    <p>
      Ваша лента записей формируется просто: вы видите посты ваших друзей, посты пользователей,
      которые ваши друзья полайкали или прокомментировали, и посты из групп, на которые вы
      подписаны. Никаких сложных алгоритмов и подкапотной магии.
    </p>

    <h4>Приватность и безопасность</h4>

    <p>
      FreeFeed — сервис и сообщество, небольшие размеры которого позволяют нам хорошо узнавать друг
      друга и общаться в кругу друзей. У нас нет политики “реальных имен”. Ваши посты могут быть
      публичными, закрытыми от поисковиков, или доступными только для ваших подписчиков.
    </p>

    <p>
      <b>
        <Link to="/signup" className="inline-header">
          Зарегистрироваться
        </Link>
      </b>{' '}
      или
      <Link to="/signin" className="inline-header">
        войти
      </Link>
    </p>
  </div>
);
