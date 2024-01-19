/* global CONFIG */
import classnames from 'classnames';
import { useState } from 'react';
import { Link } from 'react-router';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

import styles from './donate.module.scss';
import { useDonationStatus } from './hooks/donation-status';
import { useBool } from './hooks/bool';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';
import { faLiberaPay, faYooMoney, faBoosty } from './fontawesome-custom-icons';

const cfg = CONFIG.donations;

const LANGUAGES = [
  { id: 'en', label: 'In English' },
  { id: 'ru', label: 'По-русски' },
];

// eslint-disable-next-line complexity
export default function Donate({ donationAccountName = cfg.statusAccount }) {
  const statusText = useDonationStatus(donationAccountName);
  const [fundingStatusDetailsOpened, fundingStatusDetailsToggle] = useBool(false);

  const [lang, setLang] = useState(LANGUAGES[0].id);

  return (
    <div className="box">
      <div className="box-header-timeline" />
      <div className="box-body">
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

        <section className={styles.main} lang={lang}>
          {lang === 'en' ? (
            <>
              <h3 className={styles.header}>Donate to FreeFeed</h3>
              <p>
                FreeFeed is funded by voluntary donations from its users. These donations are the
                only source of income for FreeFeed as it has no sponsors and doesn&apos;t run ads.
                FreeFeed uses this money to pay for its hosting, development, and administration.
              </p>
              <ul>
                {cfg.reportsAccount && (
                  <li>
                    <Link to={`/${cfg.reportsAccount}`}>
                      Read annual funding and expenses reports
                    </Link>
                  </li>
                )}
                <li>
                  <a
                    href="https://ariregister.rik.ee/eng/company/80385994/FreeFeednet-MT%C3%9C?lang=en"
                    target="_blank"
                    rel="noreferrer noopwener"
                  >
                    Read about FreeFeed.net MTÜ
                  </a>
                  , the non-profit organisation that maintains FreeFeed.net
                </li>

                {statusText && (
                  <li>
                    <p className={styles.currentFundingStatus}>
                      Current funding status:{' '}
                      <span className={styles.widgetStatusLink} data-status={statusText}>
                        {statusText}
                      </span>{' '}
                      &mdash;{' '}
                      <ButtonLink onClick={fundingStatusDetailsToggle} className={styles.huh}>
                        What does this mean?
                        {fundingStatusDetailsOpened && ' (click to collapse)'}
                      </ButtonLink>
                    </p>
                    <section
                      className={styles.statusDetailsBox}
                      hidden={!fundingStatusDetailsOpened}
                    >
                      <p>
                        Our expenses fall into three main categories: hosting expenses,
                        administration expenses such as banking and accounting fees, and expenses
                        for development of new features. We also use the term &quot;reserve
                        fund&quot; to describe the amount of money that we need to run FreeFeed for
                        a year, including hosting and administration expenses. As of February of
                        2022, this amount is 1300 EUR.
                      </p>
                      <p>
                        Funding statuses show how well the monthly donations we receive match our
                        monthly expenses.
                      </p>
                      <ul className={styles.listOfFundingStatuses}>
                        <li>
                          <strong>Very good</strong> means that we&apos;ve met our reserve fund
                          goal. We had enough donations last month to cover monthly hosting fees,
                          and at least 800 EUR extra to pay for the development of new features.
                        </li>
                        <li>
                          <strong>Good</strong> means that we&apos;ve met our reserve fund goal. We
                          had enough donations last month to cover monthly hosting fees, and at
                          least 400 EUR extra to pay for the development of new features.
                        </li>
                        <li>
                          <strong>OK</strong> means that we&apos;ve met our reserve fund goal. We
                          had enough donations last month to cover monthly hosting fees, and we had
                          about 200 EUR extra. This is not enough to pay for the development of new
                          features this month, but we can save up and do it later.
                        </li>
                        <li>
                          <strong>Low</strong> means that we&apos;ve met our reserve fund goal, we
                          had enough donations last month to cover monthly hosting fees, but we
                          cannot afford to paying for anything else.
                        </li>
                        <li>
                          <strong>Very low</strong> means that we&apos;ve met our reserve fund goal,
                          but we did not have enough donations last month to cover monthly hosting
                          fees. This means we are using our reserves, or will have to start using
                          them soon.
                        </li>
                        <li>
                          <strong>Critical</strong> means that we only have enough money left in our
                          reserves to run FreeFeed for a few months, and our future is at risk.
                        </li>
                      </ul>
                    </section>
                  </li>
                )}
              </ul>

              <p className={styles.plea}>
                Your support is vital for FreeFeed. You can support us by making a one-time or a
                recurring monthly donation. Thank you!{' '}
                <Icon icon={faHeart} className={styles.like} />
              </p>

              <div className={styles.donationMethods}>
                {cfg.paymentMethods.liberaPayProject && (
                  <div
                    className={classnames(styles.donationMethodBox, styles.importantDonationMethod)}
                  >
                    <h4>Liberapay</h4>

                    <p className={styles.donationMethodHint}>
                      One-time or recurring donations via most credit and debit cards. Liberapay
                      does not take a cut of donations. Fees depend on donation amount and schedule
                    </p>

                    <form
                      method="get"
                      action={`https://liberapay.com/${cfg.paymentMethods.liberaPayProject}/donate`}
                      target="_blank"
                    >
                      <button className="btn btn-primary" type="submit">
                        <Icon icon={faLiberaPay} /> Donate with Liberapay
                      </button>
                    </form>
                  </div>
                )}

                {(cfg.paymentMethods.payPalRegularButtonId ||
                  cfg.paymentMethods.payPalOneTimeButtonId) && (
                  <div className={styles.donationMethodBox}>
                    <h4>Paypal</h4>
                    {cfg.paymentMethods.payPalRegularButtonId && (
                      <>
                        <p className={styles.donationMethodHint}>Recurring donation</p>
                        <form
                          action="https://www.paypal.com/cgi-bin/webscr"
                          method="post"
                          target="_blank"
                        >
                          <input type="hidden" name="cmd" value="_s-xclick" />
                          <input
                            type="hidden"
                            name="hosted_button_id"
                            value={cfg.paymentMethods.payPalRegularButtonId}
                          />
                          <input type="hidden" name="currency_code" value="EUR" />
                          <input type="hidden" name="on0" value="Pick monthly donation amount" />
                          <select
                            className="form-control"
                            name="os0"
                            style={{ marginBottom: '0.5em' }}
                          >
                            <option value="Entry Level Supporter">€5.00 EUR / month</option>
                            <option value="Basic Level Supporter">€10.00 EUR / month</option>
                            <option value="Standard Level Supporter">€15.00 EUR / month</option>
                            <option value="Pro Supporter">€20.00 EUR / month</option>
                            <option value="Master Supporter">€30.00 EUR / month</option>
                            <option value="Honorable Supporter">€50.00 EUR / month</option>
                            <option value="Master Donator">€75.00 EUR / month</option>
                            <option value="Chuck Norris">€100.00 EUR / month</option>
                          </select>
                          <button className="btn btn-primary" type="submit">
                            <Icon icon={faPaypal} /> Donate with PayPal
                          </button>
                        </form>
                      </>
                    )}

                    {cfg.paymentMethods.payPalOneTimeButtonId && (
                      <>
                        <p className={styles.donationMethodHint}>One-time donation</p>
                        <form
                          action="https://www.paypal.com/cgi-bin/webscr"
                          method="post"
                          target="_blank"
                        >
                          <input type="hidden" name="cmd" value="_s-xclick" />
                          <input
                            type="hidden"
                            name="hosted_button_id"
                            value={cfg.paymentMethods.payPalOneTimeButtonId}
                          />
                          <button className="btn btn-primary" type="submit">
                            <Icon icon={faPaypal} /> Donate with PayPal
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                )}

                {cfg.paymentMethods.boostyProject && (
                  <div className={styles.donationMethodBox}>
                    <h4>Boosty</h4>
                    <p className={styles.donationMethodHint}>
                      Supports Russian credit cards, YooMoney, QIWI, VK Pay. Fees depend on donation
                      currency and payment method
                    </p>
                    <form
                      method="get"
                      action={`https://boosty.to/${cfg.paymentMethods.boostyProject}`}
                      target="_blank"
                    >
                      <button className="btn btn-primary" type="submit">
                        <Icon icon={faBoosty} /> Donate with Boosty
                      </button>
                    </form>
                  </div>
                )}

                {cfg.paymentMethods.yasobeRuProject && (
                  <div className={styles.donationMethodBox}>
                    <h4>YooMoney</h4>
                    <p className={styles.donationMethodHint}>
                      You can make a one-time payment with your card or YooMoney wallet
                    </p>
                    <form
                      method="get"
                      action={`https://sobe.ru/na/${cfg.paymentMethods.yasobeRuProject}`}
                      target="_blank"
                    >
                      <button className="btn btn-default" type="submit">
                        <Icon icon={faYooMoney} /> Donate with YooMoney
                      </button>
                    </form>
                  </div>
                )}

                <div
                  className={classnames(styles.donationMethodBox, styles.importantDonationMethod)}
                >
                  <h4>Bank transfer</h4>
                  <p className={styles.donationMethodHint}>
                    You can send a donation from your bank account by a wire transfer. Processing
                    fees are set by your bank
                  </p>
                  <table className={styles.wireTable}>
                    <tr>
                      <td>Recipient:</td>
                      <td>
                        <code>FREEFEED.NET MTÜ</code>
                      </td>
                    </tr>
                    <tr>
                      <td>IBAN:</td>
                      <td>
                        <code>EE982200221062037450</code>
                      </td>
                    </tr>
                    <tr>
                      <td>SWIFT:</td>
                      <td>
                        <code>HABAEE2X</code>
                      </td>
                    </tr>
                    <tr>
                      <td>Address:</td>
                      <td>
                        <code>Estonia, Harjumaa, Tallinn linn, Mingi tn 5-25/26, 13424</code>
                      </td>
                    </tr>
                    <tr>
                      <td>Details:</td>
                      <td>
                        <code>Donation</code> (if applicable)
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              <div className={styles.urBest}>
                You are the best <Icon icon={faHeart} className={styles.like} />
                <Icon icon={faHeart} className={styles.likeRed} />
              </div>
            </>
          ) : null}

          {lang === 'ru' ? (
            <>
              <h3 className={styles.header}>Помочь Фрифиду</h3>
              <p>
                Фрифид финансируется за счёт добровольных пожертвований от пользователей. Эти
                пожертвования являются единственным источником дохода Фрифида, поскольку у него нет
                спонсоров и на нём нет рекламы. Фрифид использует эти деньги для оплаты хостинга,
                разработки и административных расходов.
              </p>
              <ul>
                {cfg.reportsAccount && (
                  <li>
                    <Link to={`/${cfg.reportsAccount}`}>
                      Читать годовые отчёты о расходах и собираемых средствах
                    </Link>
                  </li>
                )}
                <li>
                  <a
                    href="https://ariregister.rik.ee/eng/company/80385994/FreeFeednet-MT%C3%9C?lang=en"
                    target="_blank"
                    rel="noreferrer noopwener"
                  >
                    Читать о FreeFeed.net MTÜ
                  </a>
                  , некоммерческой организации волонтёров, поддерживающих FreeFeed.net
                </li>

                {statusText && (
                  <li>
                    <p className={styles.currentFundingStatus}>
                      Текущее состояние финансов:{' '}
                      <span className={styles.widgetStatusLink} data-status={statusText}>
                        {statusText}
                      </span>{' '}
                      &mdash;{' '}
                      <ButtonLink onClick={fundingStatusDetailsToggle} className={styles.huh}>
                        Что это значит?
                        {fundingStatusDetailsOpened && ' (закрыть)'}
                      </ButtonLink>
                    </p>
                    <section
                      className={styles.statusDetailsBox}
                      hidden={!fundingStatusDetailsOpened}
                    >
                      <p>
                        Расходы FreeFeed сводятся к трем основным категориям: затраты на хостинг,
                        организационные расходы (банк, бухгалтер) и расходы на разработку новых
                        возможностей. Кроме того, есть понятие “резервный фонд”, который содержит
                        достаточное количество денег, чтобы оплачивать год хостинга и
                        организационных расходов. На февраль 2022 года резервный фонд составляет
                        1300 евро.
                      </p>
                      <p>
                        Уровни финансирования показывают, насколько собираемые ежемесячно средства
                        позволяют оплачивать эти статьи расходов.
                      </p>
                      <ul className={styles.listOfFundingStatuses}>
                        <li>
                          <strong>Very good</strong> означает, что резервный фонд заполнен,
                          собираемых денег достаточно для оплаты хостинга и ещё как минимум 800 евро
                          остается для оплаты разработки новых возможностей.
                        </li>
                        <li>
                          <strong>Good</strong> означает, что резервный фонд заполнен, собираемых
                          денег достаточно для оплаты хостинга и ещё как минимум 400 евро остается
                          для оплаты разработки новых возможностей.
                        </li>
                        <li>
                          <strong>OK</strong> означает, что резервный фонд заполнен, собираемых
                          денег достаточно для оплаты хостинга и ещё остается около 200 евро. На
                          оплату разработки новых возможностей в этом месяце этого не хватит, но
                          можно накопить и потом потратить на разработку.
                        </li>
                        <li>
                          <strong>Low</strong> означает, что резервный фонд заполнен, собираемых
                          денег достаточно для оплаты хостинга и только.
                        </li>
                        <li>
                          <strong>Very low</strong> означает, что резервный фонд заполнен, но
                          собираемых ежемесячно денег недостаточно для оплаты хостинга. Это значит,
                          что мы тратим или скоро начнем тратить резервный фонд.
                        </li>
                        <li>
                          <strong>Critical</strong> означает, что в резервном фонде осталось денег
                          на несколько месяцев, и дальнейшее существование FreeFeed под угрозой.
                        </li>
                      </ul>
                    </section>
                  </li>
                )}
              </ul>

              <p className={styles.plea}>
                Фрифиду необходима ваша поддержка. Вы можете помочь нам единоразовыми или
                регулярными пожертвованиями. Спасибо!{' '}
                <Icon icon={faHeart} className={styles.like} />
              </p>

              <div className={styles.donationMethods}>
                {cfg.paymentMethods.liberaPayProject && (
                  <div
                    className={classnames(styles.donationMethodBox, styles.importantDonationMethod)}
                  >
                    <h4>Liberapay</h4>

                    <p className={styles.donationMethodHint}>
                      Одноразовые или регулярные пожертвования с большинства кредитных или дебитовых
                      карт. Liberapay не зарабатывает на платёжах. Размер комиссии зависит от суммы
                      и графика платежей
                    </p>

                    <form
                      method="get"
                      action={`https://liberapay.com/${cfg.paymentMethods.liberaPayProject}/donate`}
                      target="_blank"
                    >
                      <button className="btn btn-primary" type="submit">
                        <Icon icon={faLiberaPay} /> Пожертвовать через Liberapay
                      </button>
                    </form>
                  </div>
                )}

                {(cfg.paymentMethods.payPalRegularButtonId ||
                  cfg.paymentMethods.payPalOneTimeButtonId) && (
                  <div className={styles.donationMethodBox}>
                    <h4>Paypal</h4>
                    {cfg.paymentMethods.payPalRegularButtonId && (
                      <>
                        <p className={styles.donationMethodHint}>Регулярные пожертвования</p>
                        <form
                          action="https://www.paypal.com/cgi-bin/webscr"
                          method="post"
                          target="_blank"
                        >
                          <input type="hidden" name="cmd" value="_s-xclick" />
                          <input
                            type="hidden"
                            name="hosted_button_id"
                            value={cfg.paymentMethods.payPalRegularButtonId}
                          />
                          <input type="hidden" name="currency_code" value="EUR" />
                          <input type="hidden" name="on0" value="Pick monthly donation amount" />
                          <select
                            className="form-control"
                            name="os0"
                            style={{ marginBottom: '0.5em' }}
                          >
                            <option value="Entry Level Supporter">€5.00 EUR / мес</option>
                            <option value="Basic Level Supporter">€10.00 EUR / мес</option>
                            <option value="Standard Level Supporter">€15.00 EUR / мес</option>
                            <option value="Pro Supporter">€20.00 EUR / мес</option>
                            <option value="Master Supporter">€30.00 EUR / мес</option>
                            <option value="Honorable Supporter">€50.00 EUR / мес</option>
                            <option value="Master Donator">€75.00 EUR / мес</option>
                            <option value="Chuck Norris">€100.00 EUR / мес</option>
                          </select>
                          <button className="btn btn-primary" type="submit">
                            <Icon icon={faPaypal} /> Пожертвовать через PayPal
                          </button>
                        </form>
                      </>
                    )}

                    {cfg.paymentMethods.payPalOneTimeButtonId && (
                      <>
                        <p className={styles.donationMethodHint}>Единоразовое пожертвование</p>
                        <form
                          action="https://www.paypal.com/cgi-bin/webscr"
                          method="post"
                          target="_blank"
                        >
                          <input type="hidden" name="cmd" value="_s-xclick" />
                          <input
                            type="hidden"
                            name="hosted_button_id"
                            value={cfg.paymentMethods.payPalOneTimeButtonId}
                          />
                          <button className="btn btn-primary" type="submit">
                            <Icon icon={faPaypal} /> Пожертвовать через PayPal
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                )}

                {cfg.paymentMethods.boostyProject && (
                  <div className={styles.donationMethodBox}>
                    <h4>Boosty</h4>
                    <p className={styles.donationMethodHint}>
                      Подходит для российских кредитных карт, YooMoney, QIWI, VK Pay. Комиссия
                      зависит от размера и метода платежа
                    </p>
                    <form
                      method="get"
                      action={`https://boosty.to/${cfg.paymentMethods.boostyProject}`}
                      target="_blank"
                    >
                      <button className="btn btn-primary" type="submit">
                        <Icon icon={faBoosty} /> Пожертвовать через Boosty
                      </button>
                    </form>
                  </div>
                )}

                {cfg.paymentMethods.yasobeRuProject && (
                  <div className={styles.donationMethodBox}>
                    <h4>YooMoney</h4>
                    <p className={styles.donationMethodHint}>
                      Вы можете сделать единоразовый платеж с помощью платежной карточки или
                      кошелька YooMoney
                    </p>
                    <form
                      method="get"
                      action={`https://sobe.ru/na/${cfg.paymentMethods.yasobeRuProject}`}
                      target="_blank"
                    >
                      <button className="btn btn-default" type="submit">
                        <Icon icon={faYooMoney} /> Пожертвовать через YooMoney
                      </button>
                    </form>
                  </div>
                )}

                <div
                  className={classnames(styles.donationMethodBox, styles.importantDonationMethod)}
                >
                  <h4>Прямой платеж (вне РФ)</h4>
                  <p className={styles.donationMethodHint}>
                    Вы можете сделать пожертвование банковским переводом. Комиссия за обработку
                    перевода устанавливается вашим банком
                  </p>
                  <table className={styles.wireTable}>
                    <tr>
                      <td>Получатель:</td>
                      <td>
                        <code>FREEFEED.NET MTÜ</code>
                      </td>
                    </tr>
                    <tr>
                      <td>IBAN:</td>
                      <td>
                        <code>EE982200221062037450</code>
                      </td>
                    </tr>
                    <tr>
                      <td>Код SWIFT:</td>
                      <td>
                        <code>HABAEE2X</code>
                      </td>
                    </tr>
                    <tr>
                      <td>Адрес:</td>
                      <td>
                        <code>Estonia, Harjumaa, Tallinn linn, Mingi tn 5-25/26, 13424</code>
                      </td>
                    </tr>
                    <tr>
                      <td>Назначение&nbsp;платежа:</td>
                      <td>
                        <code>Donation</code> (если нужно указывать)
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              <div className={styles.urBest}>
                Вы лучше всех <Icon icon={faHeart} className={styles.like} />
                <Icon icon={faHeart} className={styles.likeRed} />
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
