import { describe, expect, it } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import PieceOfText from '../../../src/components/piece-of-text';
import Linkify from '../../../src/components/linkify';

describe('<PieceOfText>', () => {
  it('should correctly process multiline texts (short text with newlines)', () => {
    const text =
      '\n\n\n\n First paragraph \n\n\n Second paragraph, first line \n Second paragraph, second line \n\n';

    // Test collapsed state
    render(<PieceOfText text={text} />);
    expect(
      screen.getByText(
        'First paragraph Second paragraph, first line Second paragraph, second line',
        { selector: 'span' },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Expand' })).toBeInTheDocument();

    // Test expanded state
    cleanup();
    const { container } = render(<PieceOfText text={text} isExpanded />);
    const linkifyEl = container.querySelector('.Linkify');
    // We have pretty complex structure here, so we just snapshot it
    expect(linkifyEl).toMatchSnapshot();
    expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
  });

  it('should correctly process multiline texts (long text without newlines)', () => {
    const text =
      '1000: Не мысля гордый свет 27 забавить, Вниманье дружбы возлюбя, Хотел 71 бы я тебе представить Залог 102 достойнее тебя, Достойнее души прекрасной, 149 Святой исполненной мечты, Поэзии живой 192 и ясной, Высоких дум и простоты; Но 232 так и быть - рукой пристрастной Прими 274 собранье пестрых глав, Полусмешных, полупечальных, 329 Простонародных, идеальных, Небрежный плод моих 380 забав, Бессониц, легких вдохновений, Незрелых 430 и увядших лет, Ума холодных наблюдений 473 И сердца горестных замет. ГЛАВА ПЕРВАЯ 516 И жить торопится и чувствовать спешит. К. 562 Вяземский. I. "Мой дядя самых 596 честных правил, Когда не в шутку 633 занемог, Он уважать себя заставил 671 И лучше выдумать не мог. Его 704 пример другим наука; Но, боже 738 мой, какая скука С больным сидеть 776 и день и ночь, Не отходя ни 808 шагу прочь! Какое низкое коварство 847 Полу-живого забавлять, Ему подушки поправлять, 898 Печально подносить лекарство, Вздыхать и думать 950 про себя: Когда же чорт 978 возьмет тебя!" II.';

    const trimmedText =
      '1000: Не мысля гордый свет 27 забавить, Вниманье дружбы возлюбя, Хотел 71 бы я тебе представить Залог 102 достойнее тебя, Достойнее души прекрасной, 149 Святой исполненной мечты, Поэзии живой 192 и ясной, Высоких дум и простоты; Но 232 так и быть - рукой пристрастной Прими 274 собранье пестрых глав, Полусмешных, полупечальных, 329 Простонародных, идеальных, Небрежный плод моих 380 забав, Бессониц, легких вдохновений, Незрелых 430 и увядших лет, Ума холодных наблюдений 473 И сердца горестных замет. ГЛАВА ПЕРВАЯ 516 И жить торопится и чувствовать спешит. К. 562 Вяземский. I. "Мой дядя самых...';

    {
      const { container } = render(<PieceOfText text={text} />);
      const linkifyEl = container.querySelector('.Linkify');
      expect(linkifyEl.textContent).toBe(`${trimmedText} Read more`);
    }

    cleanup();

    {
      const { container } = render(<PieceOfText text={text} isExpanded />);
      const linkifyEl = container.querySelector('.Linkify');
      expect(linkifyEl.textContent).toBe(text);
    }
  });

  it('should correctly process single-line texts', () => {
    const text = 'ururu n ururu3';

    const { container } = render(<PieceOfText text={text} />);
    const linkifyEl = container.querySelector('.Linkify');
    expect(linkifyEl.textContent).toBe(text);
  });

  it('should correctly process texts with markup', () => {
    const text = 'ururu <b>n</b> ururu3';

    const { container } = render(<PieceOfText text={text} />);
    const linkifyEl = container.querySelector('.Linkify');
    expect(linkifyEl.textContent).toBe(text);
  });

  it('should correctly process texts with spoilers', () => {
    const text =
      '123 <spoiler> <spoiler>456</spoiler> 789 <спойлер>https://example.com</спойлер> 123';

    const { container } = render(<Linkify>{text}</Linkify>);
    expect(container).toMatchSnapshot();
  });

  it('should correctly process texts with inline code', () => {
    const code = '1+1=2; foo(); @mention user@example.com #hashtag ^ <spoiler>https://example.com';
    const text = `Here is the code \`${code}\`. </spoiler> Read it carefully`;

    const { container } = render(<Linkify>{text}</Linkify>);
    expect(container).toMatchSnapshot();
  });

  it('should correctly process texts with code blocks', () => {
    const codeBlock =
      '```\n1+1=2; foo(); @mention \n user@example.com \n\n #hashtag \n ^ \n\n <spoiler>https://example.com\n```';
    const text = `Here is the code block\n ${codeBlock}\n</spoiler> Read it carefully`;

    const { container } = render(<Linkify>{text}</Linkify>);
    expect(container).toMatchSnapshot();
  });
});
