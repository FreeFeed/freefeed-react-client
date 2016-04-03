import test from 'tape';
import React from 'react';

import PieceOfText from 'src/components/piece-of-text';
import sd from 'skin-deep';

const renderText = (text) => {
  const tree = sd.shallowRender(React.createElement(PieceOfText, {text}));
  return tree.getRenderOutput().props.children;
};

test('multiline texts are correctly processed', t => {

  const text = '\n\n\n\n ururu \n\n\n ururu2 \n ururu3 \n\n';

  const rendered = renderText(text);

  // What we expect here is:
  // <p>ururu</p>
  // <span>ururu2<br/></span>
  // ururu3

  t.equal(rendered[0].type, 'p');
  t.equal(rendered[0].props.children[0], 'ururu');
  t.equal(rendered[1][0].type, 'span');
  t.equal(rendered[1][0].props.children[0], 'ururu2');
  t.equal(rendered[1][0].props.children[1].type, 'br');
  t.equal(rendered[1][1], 'ururu3');

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
