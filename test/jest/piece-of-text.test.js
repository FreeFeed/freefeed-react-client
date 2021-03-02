/* global describe, it, expect */
import { render, screen, fireEvent } from '@testing-library/react';

import PieceOfText from '../../src/components/piece-of-text';

describe('PieceOfText', () => {
  it('Renders a short piece of text', () => {
    const { asFragment } = render(
      <PieceOfText
        text={
          '\n\n\n\n First paragraph \n\n\n Second paragraph, first line \n Second paragraph, second line \n\n'
        }
      />,
    );

    expect(asFragment()).toMatchSnapshot();

    fireEvent.click(screen.getByText('Expand'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders a very long piece of text', () => {
    const { asFragment } = render(
      <PieceOfText
        text={
          '1000: Не мысля гордый свет 27 забавить, Вниманье дружбы возлюбя, Хотел 71 бы я тебе представить Залог 102 достойнее тебя, Достойнее души прекрасной, 149 Святой исполненной мечты, Поэзии живой 192 и ясной, Высоких дум и простоты; Но 232 так и быть - рукой пристрастной Прими 274 собранье пестрых глав, Полусмешных, полупечальных, 329 Простонародных, идеальных, Небрежный плод моих 380 забав, Бессониц, легких вдохновений, Незрелых 430 и увядших лет, Ума холодных наблюдений 473 И сердца горестных замет. ГЛАВА ПЕРВАЯ 516 И жить торопится и чувствовать спешит. К. 562 Вяземский. I. "Мой дядя самых 596 честных правил, Когда не в шутку 633 занемог, Он уважать себя заставил 671 И лучше выдумать не мог. Его 704 пример другим наука; Но, боже 738 мой, какая скука С больным сидеть 776 и день и ночь, Не отходя ни 808 шагу прочь! Какое низкое коварство 847 Полу-живого забавлять, Ему подушки поправлять, 898 Печально подносить лекарство, Вздыхать и думать 950 про себя: Когда же чорт 978 возьмет тебя!" II.'
        }
      />,
    );

    expect(asFragment()).toMatchSnapshot();

    fireEvent.click(screen.getByText('Read more'));
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders text with spoilers', () => {
    const { asFragment } = render(
      <PieceOfText
        text={'123 <spoiler> <spoiler>456</spoiler> 789 <спойлер>https://example.com</спойлер> 123'}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders an empty span if empty', () => {
    const { asFragment } = render(<PieceOfText />);

    expect(asFragment()).toMatchSnapshot();
  });
});
