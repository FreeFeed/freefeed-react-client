import { useCallback, useState } from 'react';
import { setCookie } from '../utils';
import style from './privacy-popup.module.scss';

export default function PrivacyPopup({ name, days }) {
  const [accepted, setAccepted] = useState(false);

  const onAccept = useCallback(() => {
    setCookie(name, 'true', days, '/');
    setAccepted(true);
  }, [days, name]);

  return accepted ? null : (
    <div className={style.popup}>
      <div className={style.box}>
        <div>
          This site uses cookies and other technologies to collect data and enhance your experience.
          Visit our <a href={'/about/privacy'}>Privacy Policy</a> to learn more. By clicking
          &quot;Accept&quot; or by continuing to use our site you agree to this use of cookies and
          data.
        </div>
        <div>
          <button className={style.button} onClick={onAccept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
