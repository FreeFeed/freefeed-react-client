/* global CONFIG */
import { Link } from 'react-router';
import { LiberaPayWidget } from './libera-pay-widget';

import styles from './donate.module.scss';
import { useDonationStatus } from './hooks/donation-status';
import { useBool } from './hooks/bool';
import { ButtonLink } from './button-link';

const handleClickOnOneTimeDonation = () => {
  document.forms['singlePayPalPayment'].submit();
};

export default function Donate({ donationAccountName = CONFIG.donations.statusAccount }) {
  const statusText = useDonationStatus(donationAccountName);
  const [rusDetailsOpened, rusDetailsToggle] = useBool(false);
  const [engDetailsOpened, engDetailsToggle] = useBool(false);

  return (
    <div className="box">
      <div className="box-header-timeline" />
      <div className="box-body">
        <h3>Donate to FreeFeed</h3>

        <p>
          <a href="#russian">🇷🇺 Прочесть по-русски</a>
        </p>

        <form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_top"
          id="singlePayPalPayment"
        >
          <input type="hidden" name="cmd" value="_s-xclick" />
          <input type="hidden" name="hosted_button_id" value="HMVYD6GEWNWH8" />
          <input
            type="image"
            src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
            width="0"
            height="0"
            name="submit"
            alt="PayPal - The safer, easier way to pay online!"
          />
          <img
            alt=""
            src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
            width="1"
            height="1"
            style={{ display: 'none !important' }}
          />
        </form>

        <p>
          <Link to="/about">FreeFeed</Link> is a small-scale social network and a blogging platform.
          It is maintained by a non-profit organization FreeFeed MTU and is funded by voluntary
          donations from its users. These donations are the only source of income for FreeFeed as it
          has no sponsors and doesn&apos;t run ads.
        </p>

        <p>All the hosting expenses are covered by donations only.</p>

        {statusText && (
          <>
            <p>
              Current funding status:{' '}
              <span className={styles.statusLink} data-status={statusText}>
                {statusText}
              </span>{' '}
              <ButtonLink onClick={engDetailsToggle}>
                What it means?{engDetailsOpened && ' (collapse)'}
              </ButtonLink>
            </p>
            <section className={styles.statusDetails} hidden={!engDetailsOpened}>
              <p>
                FreeFeed expenses fall into three main categories: hosting expenses, administration
                expenses such as banking and accounting fees, and expenses for development of new
                features. We also use the term &quot;reserve fund&quot; to describe the amount of
                money that we need to run FreeFeed for a year, including hosting and administration
                expenses. As of February of 2021, this amount is 1700 EUR.
              </p>
              <p>
                Funding statuses show how well the monthly donations we receive match our monthly
                expenses.
              </p>
              <p>
                <strong>Very good</strong> means that we&amp;ve met our reserve fund goal. We had
                enough donations last month to cover monthly hosting fees, and at least 800 EUR
                extra to pay for the development of new features.
              </p>
              <p>
                <strong>Good</strong> means that we&amp;ve met our reserve fund goal. We had enough
                donations last month to cover monthly hosting fees, and at least 400 EUR extra to
                pay for the development of new features.
              </p>
              <p>
                <strong>OK</strong> means that we&amp;ve met our reserve fund goal. We had enough
                donations last month to cover monthly hosting fees, and we had about 200 EUR extra.
                This is not enough to pay for the development of new features this month, but we can
                save up and do it later.
              </p>
              <p>
                <strong>Low</strong> means that we&amp;ve met our reserve fund goal, we had enough
                donations last month to cover monthly hosting fees, but we cannot afford to
                paypaying for anything else.
              </p>
              <p>
                <strong>Very low</strong> means that we&amp;ve met our reserve fund goal, but we did
                not have enough donations last month to cover monthly hosting fees. This means we
                are using our reserves, or will have to start using them soon.
              </p>
              <p>
                <strong>Critical</strong> means that we only have enough money left in our reserves
                to run FreeFeed for a few months, and our future is at risk.
              </p>
            </section>
          </>
        )}

        {CONFIG.donations.reportsAccount && (
          <p>
            <Link to={`/${CONFIG.donations.reportsAccount}`}>Funding and expenses reports</Link>
          </p>
        )}

        <p>You can help us pay for the hosting by setting up a monthly donation.</p>

        <h4>
          Easy way <small>(accept all cards, 20% commission fee)</small>
        </h4>
        <LiberaPayWidget project="freefeed" />

        <span style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value="97PAKQ6S97XMW" />
            <h4>
              Paypal way <small>(7% commission fee)</small>
            </h4>
            <table>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: '5px' }}>
                    <input
                      type="hidden"
                      name="on0"
                      value="Pick monthly donation amount"
                      style={{ padding: '5px 0' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <select name="os0" defaultValue="Advanced">
                      <option value="Entry Level Supporter">€5.00 EUR / month</option>
                      <option value="Basic Level Supporter">€10.00 EUR / month</option>
                      <option value="Standard Level Supporter">€15.00 EUR / month</option>
                      <option value="Pro Supporter">€20.00 EUR / month</option>
                      <option value="Master Supporter">€30.00 EUR / month</option>
                      <option value="Honorable Supporter">€50.00 EUR / month</option>
                      <option value="Master Donator">€75.00 EUR / month</option>
                      <option value="Chuck Norris">€100.00 EUR / month</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>

            <input type="hidden" name="currency_code" value="EUR" />
            <input
              type="image"
              src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
              name="submit"
              alt="PayPal - The safer, easier way to pay online!"
              style={{ margin: '5px' }}
            />
            <img
              alt=""
              src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
              width="1"
              height="1"
              style={{ display: 'none !important' }}
            />
          </form>
        </span>

        <p style={{ marginTop: '15px' }}>
          Alternatively, you can make a{' '}
          <span
            onClick={handleClickOnOneTimeDonation}
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            one-time Paypal donation
          </span>
          .
        </p>
        <h4>Responsible way</h4>
        <p>
          You can set up recurring monthly donation through your internet bank account (commission
          fees depend on your bank).
          <br />
          Payment details:
          <br />
          Organization name: <code>FREEFEED.NET MTÜ</code>
          <br />
          IBAN: <code>EE982200221062037450</code>
          <br />
          SWIFT Code: <code>HABAEE2X</code>
          <br />
          Legal address: <code>Harjumaa, Tallinn linn, Mingi tn 5-25/26, 13424</code>
        </p>

        <h4>The Russian way</h4>
        <p>
          You can make a one-time payment with your card or Yandex.Money wallet (commission fee
          0.5-2%):
          <br />
          Pay with{' '}
          <a href="https://yasobe.ru/na/freefeed" target="_blank">
            Yandex.Money
          </a>
        </p>

        <p>Thank you!</p>

        <h3 id="russian">Помочь Фрифиду</h3>

        <p>
          <Link to="/about">FreeFeed</Link> - это небольшая социальная сеть и блог-платформа без
          рекламы и цензуры. Она создана и поддерживается некоммерческой организацией волонтеров
          FreeFeed MTU на средства, которые добровольно жертвуют пользователи — это единственный
          источник денег, у нас нет спонсоров и рекламы.
        </p>

        {statusText && (
          <>
            <p>
              Текущее состояние финансов:{' '}
              <span className={styles.statusLink} data-status={statusText}>
                {statusText}
              </span>{' '}
              <ButtonLink onClick={rusDetailsToggle}>
                Что это значит?{rusDetailsOpened && ' (закрыть)'}
              </ButtonLink>
            </p>
            <section className={styles.statusDetails} hidden={!rusDetailsOpened}>
              <p>
                Расходы FreeFeed сводятся к трем основным категориям: затраты на хостинг,
                организационные расходы (банк, бухгалтер) и расходы на разработку новых
                возможностей. Кроме того, есть понятие “резервный фонд”, который содержит
                достаточное количество денег, чтобы оплачивать год хостинга и организационных
                расходов. На февраль 2021 года резервный фонд составляет 1700 евро.
              </p>
              <p>
                Уровни финансирования показывают, насколько собираемые ежемесячно средства позволяют
                оплачивать эти статьи расходов.
              </p>
              <p>
                <strong>Very good</strong> означает, что резервный фонд заполнен, собираемых денег
                достаточно для оплаты хостинга и ещё как минимум 800 евро остается для оплаты
                разработки новых возможностей.
              </p>
              <p>
                <strong>Good</strong> означает, что резервный фонд заполнен, собираемых денег
                достаточно для оплаты хостинга и ещё как минимум 400 евро остается для оплаты
                разработки новых возможностей.
              </p>
              <p>
                <strong>OK</strong> означает, что резервный фонд заполнен, собираемых денег
                достаточно для оплаты хостинга и ещё остается около 200 евро. На оплату разработки
                новых возможностей в этом месяце этого не хватит, но можно накопить и потом
                потратить на разработку.
              </p>
              <p>
                <strong>Low</strong> означает, что резервный фонд заполнен, собираемых денег
                достаточно для оплаты хостинга и только.
              </p>
              <p>
                <strong>Very low</strong> означает, что резервный фонд заполнен, но собираемых
                ежемесячно денег недостаточно для оплаты хостинга. Это значит, что мы тратим или
                скоро начнем тратить резервный фонд.
              </p>
              <p>
                <strong>Critical</strong> означает, что в резервном фонде осталось денег на
                несколько месяцев, и дальнейшее существование FreeFeed под угрозой.
              </p>
            </section>
          </>
        )}

        {CONFIG.donations.reportsAccount && (
          <p>
            <Link to={`/${CONFIG.donations.reportsAccount}`}>
              Отчеты о расходах и собираемых средствах
            </Link>
          </p>
        )}

        <p>Вы можете помочь нам, настроив автоматический ежемесячный платёж</p>

        <h4>
          Простой способ <small>(принимает все карты, комиссии около 20%)</small>
        </h4>
        <LiberaPayWidget project="freefeed" />

        <span style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value="97PAKQ6S97XMW" />
            <h4>
              Paypal <small>(комиссия около 7%)</small>
            </h4>
            <table>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: '5px' }}>
                    <input
                      type="hidden"
                      name="on0"
                      value="Pick monthly donation amount"
                      style={{ padding: '5px 0' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <select name="os0" defaultValue="Advanced">
                      <option value="Entry Level Supporter">€5.00 EUR / месяц</option>
                      <option value="Basic Level Supporter">€10.00 EUR / месяц</option>
                      <option value="Standard Level Supporter">€15.00 EUR / месяц</option>
                      <option value="Pro Supporter">€20.00 EUR / месяц</option>
                      <option value="Master Supporter">€30.00 EUR / месяц</option>
                      <option value="Honorable Supporter">€50.00 EUR / месяц</option>
                      <option value="Master Donator">€75.00 EUR / месяц</option>
                      <option value="Chuck Norris">€100.00 EUR / месяц</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>

            <input type="hidden" name="currency_code" value="EUR" />
            <input
              type="image"
              src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
              name="submit"
              alt="PayPal - The safer, easier way to pay online!"
              style={{ margin: '5px' }}
            />
            <img
              alt=""
              src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
              width="1"
              height="1"
              style={{ display: 'none !important' }}
            />
          </form>
        </span>

        <p style={{ marginTop: '15px' }}>
          Или вы можете сделать{' '}
          <span
            onClick={handleClickOnOneTimeDonation}
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            единовременный взнос
          </span>
          .
        </p>

        <h4>Прямой платеж</h4>
        <p>
          Вы можете настроить регулярные ежемесячные платежи в вашем интернет-банке (комиссии
          зависят от вашего банка).
          <br />
          Реквизиты:
          <br />
          Получатель платежа: <code>FREEFEED.NET MTÜ</code>
          <br />
          IBAN: <code>EE982200221062037450</code>
          <br />
          Код SWIFT: <code>HABAEE2X</code>
          <br />
          Адрес получателя: <code>Harjumaa, Tallinn linn, Mingi tn 5-25/26, 13424</code>
        </p>

        <h4>Яндекс.Деньги</h4>
        <p>
          Вы можете сделать единоразовый платеж с помощью платежной карточки или кошелька
          Яндекс.Денег (комиссия 0.5-2%):
          <br />
          Сделать взнос через{' '}
          <a href="https://yasobe.ru/na/freefeed" target="_blank">
            Яндекс.Деньги
          </a>
        </p>

        <p>Спасибо!</p>
      </div>
    </div>
  );
}
