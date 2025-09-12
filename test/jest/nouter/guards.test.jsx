import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';
import { Link, Route, Router, Switch } from '../../../src/services/nouter';

describe('Nouter: Guards test', () => {
  describe('should call beforeEnter and beforeChange', () => {
    let history, page, beforeEnter, beforeChange;
    beforeAll(() => {
      history = createMemoryHistory();
      beforeEnter = vi.fn();
      beforeChange = vi.fn();
      page = (
        <Router history={history}>
          <main>
            <div>Header</div>
            <ul>
              <li>
                <Link to="/foo">Foo</Link>
              </li>
              <li>
                <Link to="/foo?foo=bar">Foo 1</Link>
              </li>
            </ul>
            <Switch>
              <Route name="index" path="/">
                <div>Index page</div>
              </Route>
              <Route name="foo" path="/foo" beforeEnter={beforeEnter} beforeChange={beforeChange}>
                <div>Foo page</div>
              </Route>
            </Switch>
            <div>Footer</div>
          </main>
        </Router>
      );
    });

    it('should call beforeEnter and beforeChange', async () => {
      render(page);

      await userEvent.click(screen.getByText('Foo'));
      expect(screen.getByText('Foo page')).toBeDefined();
      expect(beforeEnter).toHaveBeenCalledTimes(1);
      expect(beforeChange).toHaveBeenCalledTimes(0);

      await userEvent.click(screen.getByText('Foo 1'));
      expect(screen.getByText('Foo page')).toBeDefined();
      expect(beforeEnter).toHaveBeenCalledTimes(1);
      expect(beforeChange).toHaveBeenCalledTimes(1);
    });
  });
});
