import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';
import { Link, Route, Router, Switch } from '../../../src/services/nouter';

describe('Nouter: Link test', () => {
  describe('should follow links', () => {
    let history, page;
    beforeAll(() => {
      history = createMemoryHistory();
      page = (
        <Router history={history}>
          <main>
            <div>Header</div>
            <ul>
              <li>
                <Link to="/">Index</Link>
              </li>
              <li>
                <Link to="/foo">Foo</Link>
              </li>
              <li>
                <Link to="/bar">Bar</Link>
              </li>
            </ul>
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

    it('should show index page at first', () => {
      render(page);
      expect(screen.getByText('Index page')).toBeDefined();
    });

    it('should show pages after clicking links', async () => {
      render(page);

      await userEvent.click(screen.getByText('Foo'));
      expect(screen.getByText('Foo page')).toBeDefined();

      await userEvent.click(screen.getByText('Bar'));
      expect(screen.getByText('Bar page')).toBeDefined();

      await userEvent.click(screen.getByText('Index'));
      expect(screen.getByText('Index page')).toBeDefined();
    });
  });
});
