import test from 'tape'
import {showHtmlEnters} from 'src/utils'

test('multiline texts are correctly processed', t => {

  const text = '\n\n\n\n ururu \n\n\n ururu2 \n ururu3 \n\n'
  const expectation = '<p>ururu</p><p>ururu2<br/>ururu3</p>'

  t.equal(showHtmlEnters(text), expectation)

  t.end()
})

test('single-line texts are correctly processed', t => {

  const text = 'ururu ururu3'
  const expectation = 'ururu ururu3'

  t.equal(showHtmlEnters(text), expectation)

  t.end()
})
