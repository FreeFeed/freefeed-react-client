import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { createMemoryHistory } from 'history';
import { Route, Router, Switch } from '../../../src/services/nouter';

describe('Nouter: basic test', () => {
  describe('should switch between routes', () => {
    let history, page;
    beforeAll(() => {
      history = createMemoryHistory();
      page = (
        <Router history={history}>
          <main>
            <div>Header</div>
            <Switch>
              <Route name="index" path="/">
                <div>Index page</div>
              </Route>
              <Route name="foo" path="/foo">
                <div>Foo page</div>
              </Route>
              <Route name="bar" path="/bar">
                <div>Bar page</div>
              </Route>
              <Route path="*">
                <div>Page not found</div>
              </Route>
            </Switch>
            <div>Footer</div>
          </main>
        </Router>
      );
    });

    it('should show index page', () => {
      history.push('/');
      const { asFragment } = render(page);
      expect(asFragment()).toMatchSnapshot();
    });

    it('should show foo page', () => {
      history.push('/foo');
      const { asFragment } = render(page);
      expect(asFragment()).toMatchSnapshot();
    });

    it('should show bar page', () => {
      history.push('/bar');
      const { asFragment } = render(page);
      expect(asFragment()).toMatchSnapshot();
    });

    it('should not show baz page', () => {
      history.push('/baz');
      const { asFragment } = render(page);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
