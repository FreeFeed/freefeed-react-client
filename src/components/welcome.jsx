import { Link } from 'react-router';

export default () => (
  <div className="box-body">
    <h3>Welcome to FreeFeed!</h3>

    <p>
      FreeFeed is a small and free social network. We do not harvest users&apos; personal data, nor
      serve ads. It is an <a href="https://github.com/FreeFeed">open-source project</a> developed by
      volunteers and funded by donations from its users.
    </p>

    <h4>No ads</h4>

    <p>
      FreeFeed is backed and maintained by a non-profit organization. We do not show ads, we do not
      collect our users&apos; data, and we do not sell anything to anyone.
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

    <h3>Что такое FreeFeed</h3>

    <p>
      FreeFeed - маленькая бесплатная социальная сеть, которая не продаёт ваши данные и не
      показывает рекламу. Это{' '}
      <a href="https://github.com/FreeFeed">проект с открытым исходным кодом</a>, которым может
      воспользоваться любой желающий. Его развитием занимаются пользователи-волонтеры, на
      пожертвования других пользователей.
    </p>

    <p>
      <b>Без рекламы</b>
    </p>

    <p>
      FreeFeed — некоммерческий проект. Мы не размещаем рекламу, не собираем информацию о наших
      пользователях и не продаём никому их данные.
    </p>

    <p>
      <b>Управляется пользователями</b>
    </p>

    <p>
      Лента записей формируется просто: вы видите посты ваших друзей, посты пользователей, которые
      ваши друзья полайкали или откомментировали или из групп, на которые вы подписаны. Никаких
      сложных алгоритмов и подкапотной магии.
    </p>

    <p>
      <b>Приватность и безопасность</b>
    </p>

    <p>
      FreeFeed — сервис и сообщество, небольшие размеры которого позволяют нам хорошо узнавать друг
      друга и общаться в кругу друзей. Это сервис для людей. Никаких жёстких правил «реальных имён»
      — вы сами выбираете себе название учётной записи, и сами решаете, под каким именем будут
      появляться ваши записи и комментарии в лентах. Ваша учётная запись может быть видна всем, или
      только вам, или вам и вашим подписчикам, или только пользователям Фрифида.
    </p>

    <p>
      <b>
        <Link to="/signup" className="inline-header">
          Зарегистрироваться
        </Link>
      </b>{' '}
      или
      <Link to="/signin" className="inline-header">
        Войти
      </Link>{' '}
      если у вас уже есть аккаунт.
    </p>
  </div>
);
