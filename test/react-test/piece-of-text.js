import test from 'tape';
import React from 'react';

import PieceOfText from 'src/components/piece-of-text';
import sd from 'skin-deep';

const renderText = (text, isExpanded = false) => {
  const tree = sd.shallowRender(React.createElement(PieceOfText, {text, isExpanded}));
  return tree.getRenderOutput().props.children;
};

test('multiline texts are correctly processed (short text with newlines)', t => {
  const text = '\n\n\n\n First paragraph \n\n\n Second paragraph, first line \n Second paragraph, second line \n\n';

  // Collapsed (default):
  //
  // <span>First paragraph Second paragraph (to be continued) Second paragraph (the end)</span>
  // {' '}
  // <a class="read-more">Expand</a>

  const collapsedText = renderText(text);

  t.equal(collapsedText[0].type, 'span');
  t.equal(collapsedText[0].props.children, 'First paragraph Second paragraph, first line Second paragraph, second line');

  t.equal(collapsedText[1], ' ');

  t.equal(collapsedText[2].type, 'a');
  t.equal(collapsedText[2].props.className, 'read-more');
  t.equal(collapsedText[2].props.children, 'Expand');

  t.equal(collapsedText[3], undefined);

  // Expanded:
  //
  // <span>First paragraph</span>
  // <div class="p-break">
  //   <br/>
  // </div>
  // <span>
  //   <span>Second paragraph, first line</span>
  //   <br/>
  //   <span>Second paragraph, second line</span>
  // </span>

  const expandedText = renderText(text, true);

  t.equal(expandedText[0].type, 'span');
  t.equal(expandedText[0].props.children[0], 'First paragraph');

  t.equal(expandedText[1].type, 'div');
  t.equal(expandedText[1].props.className, 'p-break');
  t.equal(expandedText[1].props.children.type, 'br');

  t.equal(expandedText[2].type, 'span');
  t.equal(expandedText[2].props.children[0].type, 'span');
  t.equal(expandedText[2].props.children[0].props.children, 'Second paragraph, first line');
  t.equal(expandedText[2].props.children[1].type, 'br');
  t.equal(expandedText[2].props.children[2].type, 'span');
  t.equal(expandedText[2].props.children[2].props.children, 'Second paragraph, second line');

  t.equal(expandedText[3], undefined);

  t.end();
});

test('multiline texts are correctly processed (long text without newlines)', t => {
  const text = '1000: Не мысля гордый свет 27 забавить, Вниманье дружбы возлюбя, Хотел 71 бы я тебе представить Залог 102 достойнее тебя, Достойнее души прекрасной, 149 Святой исполненной мечты, Поэзии живой 192 и ясной, Высоких дум и простоты; Но 232 так и быть - рукой пристрастной Прими 274 собранье пестрых глав, Полусмешных, полупечальных, 329 Простонародных, идеальных, Небрежный плод моих 380 забав, Бессониц, легких вдохновений, Незрелых 430 и увядших лет, Ума холодных наблюдений 473 И сердца горестных замет. ГЛАВА ПЕРВАЯ 516 И жить торопится и чувствовать спешит. К. 562 Вяземский. I. "Мой дядя самых 596 честных правил, Когда не в шутку 633 занемог, Он уважать себя заставил 671 И лучше выдумать не мог. Его 704 пример другим наука; Но, боже 738 мой, какая скука С больным сидеть 776 и день и ночь, Не отходя ни 808 шагу прочь! Какое низкое коварство 847 Полу-живого забавлять, Ему подушки поправлять, 898 Печально подносить лекарство, Вздыхать и думать 950 про себя: Когда же чорт 978 возьмет тебя!" II.';

  // Collapsed (default):
  //
  // <span>Up to 600 characters of the text plus '...'</span>
  // {' '}
  // <a class="read-more">Read more</a>

  const collapsedText = renderText(text);

  t.equal(collapsedText[0].type, 'span');
  t.equal(collapsedText[0].props.children, '1000: Не мысля гордый свет 27 забавить, Вниманье дружбы возлюбя, Хотел 71 бы я тебе представить Залог 102 достойнее тебя, Достойнее души прекрасной, 149 Святой исполненной мечты, Поэзии живой 192 и ясной, Высоких дум и простоты; Но 232 так и быть - рукой пристрастной Прими 274 собранье пестрых глав, Полусмешных, полупечальных, 329 Простонародных, идеальных, Небрежный плод моих 380 забав, Бессониц, легких вдохновений, Незрелых 430 и увядших лет, Ума холодных наблюдений 473 И сердца горестных замет. ГЛАВА ПЕРВАЯ 516 И жить торопится и чувствовать спешит. К. 562 Вяземский. I. "Мой дядя самых...');

  t.equal(collapsedText[1], ' ');

  t.equal(collapsedText[2].type, 'a');
  t.equal(collapsedText[2].props.className, 'read-more');
  t.equal(collapsedText[2].props.children, 'Read more');

  t.equal(collapsedText[3], undefined);

  // Expanded:
  //
  // Full text without any DOM elements

  const expandedText = renderText(text, true);

  t.equal(expandedText, text);

  t.end();
});

test('single-line texts are correctly processed', t => {
  const text = 'ururu n ururu3';

  t.equal(renderText(text), text);

  t.end();
});

test('texts with markup are correctly processed', t => {
  const text = 'ururu <b>n</b> ururu3';

  t.equal(renderText(text), text);

  t.end();
});
