# Agent Guidelines for freefeed-react-client

## Project Overview

This is the React-based frontend client for [FreeFeed](https://freefeed.net) — an open-source social network. The app is a single-page application built with React 19, Redux, and Vite.

## Tech Stack

- **Framework**: React 19
- **State management**: Redux 5
- **Builder**: Vite 7
- **Styling**: SCSS (Sass), CSS Modules, Bootstrap 3
- **Testing**: Vitest + Testing Library
- **Package manager**: Yarn 4 (Berry)
- **Linting**: ESLint 9 (flat config), Stylelint 17, Prettier

## Key Directories

- `src/components/` — React components
- `src/redux/` — Redux actions, reducers, middlewares
- `src/services/` — Side-effect services (API, lightbox, real-time socket, etc.)
- `src/utils/` — Pure utility functions and helpers
- `styles/` — Global SCSS styles and shared partials
- `config/` — App configuration defaults and schema
- `test/jest/` — Snapshot tests (run via Vitest)
- `test/unit/` — Unit tests

## Development Commands

```bash
yarn start          # dev server with hot reload (uses candy.freefeed.net as backend)
yarn test           # run all tests
yarn lint           # ESLint
yarn stylelint      # Stylelint for SCSS
yarn checks         # run tests + lint + stylelint in parallel
yarn build-prod     # production build into _dist/
yarn build-modern   # faster build (modern browsers only), useful for build validation
```

## Contributing

Before submitting any changes, make sure they pass **all** of the following checks:

- **`yarn lint`** — ESLint must report no errors
- **`yarn stylelint`** — Stylelint must report no errors
- **`yarn test`** — all tests must pass

Run `yarn checks` to execute all three in parallel. Use `yarn build-modern` to quickly verify the build compiles without errors (faster than the full production build).

Before opening a pull request, add a brief description of the proposed change to the `## [x.y.z] - Not released` section of `CHANGELOG.md`.

Feature branches must be started from the **stable** branch.

Commit messages must be in **English**, ideally fitting in one line ≤80 characters. More detailed commit messages (with body after the subject) are used only for complex and non-obvious changes.

## Architecture

**Entry point:** `src/index.js` loads `config.json`, then bootstraps `src/app.jsx`.

**`src/app.jsx`** creates the Redux store, defines all routes, and renders the root `<App>` component.

**Data flow:**
1. A route change or user action dispatches an action creator from `src/redux/action-creators.js`
2. Action creators that need the API attach an `apiRequest` property — `apiMiddleware` picks it up and calls `src/services/api.js`
3. The response is dispatched as a follow-up action and handled by reducers in `src/redux/reducers/`
4. Real-time events arrive via Socket.IO (`src/services/realtime.js`) and are dispatched as regular actions

**Routing:** Routes are declared in `src/app.jsx` using `<Route>` / `<Switch>` / `<Router>` from `src/services/nouter/`. To add a new page:
1. Create a component in `src/components/your-page/`
2. Add a `<Route path="your-path" component={YourPage} />` in `src/app.jsx`
3. If the route needs data, add an `onEnter` / `onChange` hook that dispatches the appropriate action creator

**Adding a Redux action:**
1. Add a constant to `src/redux/action-types.js`
2. Add a creator function to `src/redux/action-creators.js` (attach `apiRequest` for API calls)
3. Handle the action in the relevant reducer in `src/redux/reducers/`. Prefer adding new reducers as separate files in `src/redux/reducers/` rather than extending the monolithic `src/redux/reducers.js`

## Code Style

- JSX files use `.jsx` extension
- Prefer functional components with React hooks over class components
- CSS Modules are used for component-scoped styles (`.module.scss`)
- Use `lodash-es` (not `lodash`) for tree shaking
- Imports must be at the top of files
- Comments in code must be in **English**
- Pre-commit hooks run Prettier and ESLint via lint-staged (managed by Husky)

## Changelog

- Current (unreleased and current year) changes go in `CHANGELOG.md` at the repo root
- The top section is always `## [x.y.z] - Not released` for changes not yet deployed
- Past years are archived in `changelogs/CHANGELOG_YYYY.md`
- Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format

## Notes

- The lightbox is powered by PhotoSwipe 5 (`src/services/lightbox-actual.js`); `src/services/lightbox.js` is a thin facade
- Text parsing (posts, comments) is handled by `social-text-tokenizer`
- `lodash-es` is used instead of `lodash` for tree shaking — do not import from `lodash`
- Redux DevTools are supported in development (via `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__`)
