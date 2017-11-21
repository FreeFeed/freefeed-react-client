import React from 'react';
import { Link } from 'react-router';

const Donate = () => (
  <div className="box">
    <div className="box-header-timeline"></div>
    <div className="box-body">
      <h3>Donate to FreeFeed</h3>

      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" id="singlePayPalPayment">
        <input type="hidden" name="cmd" value="_s-xclick"/>
        <input type="hidden" name="hosted_button_id" value="HMVYD6GEWNWH8"/>
        <input type="image" src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" width="0" height="0" name="submit" alt="PayPal - The safer, easier way to pay online!"/>
        <img alt="" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" style={{ display: 'none !important' }}/>
      </form>

      <p><Link to="/about">FreeFeed</Link> is an open-source small scale social network without ads or censorship. It was created by
        FreeFeed MTU, a non-profit volunteers’ organization which continues to develop it now.
      </p>

      <p>All the hosting expenses are covered by donations only.</p>

      <span style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_s-xclick"/>
          <input type="hidden" name="hosted_button_id" value="97PAKQ6S97XMW"/>
          <table>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '5px' }}>
                  <input type="hidden" name="on0" value="Pick monthly donation amount" style={{ padding:'5px 0' }}/>You can help us to pay for the hosting by setting up a monthly donation:
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

          <input type="hidden" name="currency_code" value="EUR"/>
          <input type="image" src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" name="submit" alt="PayPal - The safer, easier way to pay online!" style={{ margin:'5px' }}/>
          <img alt="" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" style={{ display: 'none !important' }}/>
        </form>
      </span>

      <p style={{ marginTop: '15px' }}>Make a <span onClick={() => document.forms["singlePayPalPayment"].submit()} style={{ textDecoration:'underline', cursor:'pointer' }}>one-time donation</span>.</p>

      <p>Thank you!</p>

      <h3>Помочь Фрифиду</h3>

      <p><Link to="/about">FreeFeed</Link> -  это небольшая социальная сеть и блог-платформа без рекламы и цензуры. Ее создало некоммерческое
        сообщество пользователей, которые и развивают проект. Участники фрифида пишут под псевдонимами, а не под
        реальными именами; здесь есть тематические группы, система ограничения доступа к записям, лайки и баны.
        На базе сервиса сформировалось сообщество, участники которого не только общаются в онлайне, но и проводят
        оффлайновые встречи в разных городах и оказывает друг другу вполне реальную поддержку.
      </p>

      <p>Развитием и поддержкой проекта занимается некоммерческая организация FreeFeed MTU, которая состоит из
        пользователей-волонтёров. С момента запуска FreeFeed.net мы стремимся сделать так, чтобы проект был полностью
        самостоятельным: расходы на хостинг сервиса полностью покрывались бы взносами пользователей.
      </p>

      <span style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_s-xclick"/>
          <input type="hidden" name="hosted_button_id" value="97PAKQ6S97XMW"/>
          <table>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '5px' }}>
                  <input type="hidden" name="on0" value="Pick monthly donation amount" style={{ padding:'5px 0' }}/>Вы можете помочь нам, настроив автоматический ежемесячный платёж:
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

          <input type="hidden" name="currency_code" value="EUR"/>
          <input type="image" src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" name="submit" alt="PayPal - The safer, easier way to pay online!" style={{ margin:'5px' }}/>
          <img alt="" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" style={{ display: 'none !important' }}/>
        </form>
      </span>


      <p style={{ marginTop: '15px' }}>Cделать <span onClick={() => document.forms["singlePayPalPayment"].submit()} style={{ textDecoration:'underline', cursor:'pointer' }}>единовременный взнос</span>.</p>

      <p>Спасибо!</p>
    </div>
  </div>
);

export default Donate;
