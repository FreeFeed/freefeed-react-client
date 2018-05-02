import React from 'react';
import { Link } from 'react-router';

export default () => (
  <div className="box-body">
    <h3>What is FreeFeed</h3>

    <p>FreeFeed is a small non-profit social network. It does not sell your data, nor does it show ads to you.
      It is an <a href="https://github.com/FreeFeed">open-source project</a> which can be used by anyone.
      FreeFeed is developed by a group of volunteers and paid for by donations from its users.
    </p>

    <p><b>No Ads</b></p>

    <p>FreeFeed is a non-profit project. We do not show ads, we do not collect our users’ data,
      and we do not sell anything to anyone.
    </p>

    <p><b>Managed by users</b></p>

    <p>Your feed contains posts that your friends have written, liked, and/or commented on, as well as posts from the
      groups you’ve subscribed to. We do not utilize complicated mechanisms of showing you some kind of selected data.
    </p>

    <p><b>Security and privacy</b></p>

    <p>FreeFeed is a service as well as a community. Its relatively small scale enables us to know each other and mix
      and mingle among friends. It is a service designed for people. We do not have the iron rule of ‘real-life names’:
      you can choose whatever username you like. You can also choose the screen name to be associated with your posts
      and comments. Your username can be visible to all, or to you only, or to you and your subscribers, or to
      FreeFeed users only.
    </p>

    <p><b><Link to="/signup" className="inline-header">Sign up</Link></b> now
      or <Link to="/signin" className="inline-header">sign in</Link> if you already have an account.
    </p>

    <h3>Что такое FreeFeed</h3>

    <p>FreeFeed - маленькая бесплатная социальная сеть, которая не продаёт ваши данные и не показывает рекламу.
      Это <a href="https://github.com/FreeFeed">проект с открытым исходным кодом</a>, которым может воспользоваться
      любой желающий. Его развитием занимаются пользователи-волонтеры, на пожертвования других пользователей.
    </p>

    <p><b>Без рекламы</b></p>

    <p>FreeFeed — некоммерческий проект. Мы не размещаем рекламу, не собираем информацию о наших пользователях
      и не продаём никому их данные.
    </p>

    <p><b>Управляется пользователями</b></p>

    <p>Лента записей формируется просто: вы видите посты ваших друзей, посты пользователей, которые ваши друзья
      полайкали или откомментировали или из групп, на которые вы подписаны. Никаких сложных алгоритмов и
      подкапотной магии.
    </p>

    <p><b>Приватность и безопасность</b></p>

    <p>FreeFeed — сервис и сообщество, небольшие размеры которого позволяют нам хорошо узнавать друг друга и общаться
      в кругу друзей. Это сервис для людей. Никаких жёстких правил «реальных имён» — вы сами выбираете себе название
      учётной записи, и сами решаете, под каким именем будут появляться ваши записи и комментарии в лентах.
      Ваша учётная запись может быть видна всем, или только вам, или вам и вашим подписчикам, или только
      пользователям Фрифида.
    </p>

    <p><b><Link to="/signup" className="inline-header">Зарегистрироваться</Link></b>
      или <Link to="/signin" className="inline-header">Войти</Link> если у вас уже есть аккаунт.
    </p>
  </div>
);
