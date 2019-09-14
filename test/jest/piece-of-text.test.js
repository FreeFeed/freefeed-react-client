import React from 'react';
import { shallow } from 'enzyme';

import PieceOfText from '../../src/components/piece-of-text';

const renderPieceOfText = (props = {}) => {
  const defaultProps = {
    text: 'Some text',
    isExpanded: false,
  };

  return shallow(<PieceOfText {...defaultProps} {...props} />);
};

describe('<PieceOfText>', () => {
  it('Should correctly process multiline texts (short text with newlines)', () => {
    const text =
      '\n\n\n\n First paragraph \n\n\n Second paragraph, first line \n Second paragraph, second line \n\n';

    const actual = renderPieceOfText({ text });
    expect(actual).toMatchSnapshot();

    const actualExpanded = renderPieceOfText({ text, isExpanded: true });
    expect(actualExpanded).toMatchSnapshot();
  });

  it('Should correctly process multiline texts (long text without newlines)', () => {
    const text =
      '1000: Не мысля гордый свет 27 забавить, Вниманье дружбы возлюбя, Хотел 71 бы я тебе представить Залог 102 достойнее тебя, Достойнее души прекрасной, 149 Святой исполненной мечты, Поэзии живой 192 и ясной, Высоких дум и простоты; Но 232 так и быть - рукой пристрастной Прими 274 собранье пестрых глав, Полусмешных, полупечальных, 329 Простонародных, идеальных, Небрежный плод моих 380 забав, Бессониц, легких вдохновений, Незрелых 430 и увядших лет, Ума холодных наблюдений 473 И сердца горестных замет. ГЛАВА ПЕРВАЯ 516 И жить торопится и чувствовать спешит. К. 562 Вяземский. I. "Мой дядя самых 596 честных правил, Когда не в шутку 633 занемог, Он уважать себя заставил 671 И лучше выдумать не мог. Его 704 пример другим наука; Но, боже 738 мой, какая скука С больным сидеть 776 и день и ночь, Не отходя ни 808 шагу прочь! Какое низкое коварство 847 Полу-живого забавлять, Ему подушки поправлять, 898 Печально подносить лекарство, Вздыхать и думать 950 про себя: Когда же чорт 978 возьмет тебя!" II.';

    const actual = renderPieceOfText({ text });
    expect(actual).toMatchSnapshot();

    const actualExpanded = renderPieceOfText({ text, isExpanded: true });
    expect(actualExpanded).toMatchSnapshot();
  });

  it('Should correctly process single-line texts', () => {
    const text = 'ururu n ururu3';

    const actual = renderPieceOfText({ text });
    expect(actual).toMatchSnapshot();
  });

  it('Should correctly process texts with markup', () => {
    const text = 'ururu <b>n</b> ururu3';

    const actual = renderPieceOfText({ text });
    expect(actual).toMatchSnapshot();
  });
});
