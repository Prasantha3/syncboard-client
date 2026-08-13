<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
=======
# SyncBoard — Client (Session 1 / Assignment 1)

A real-time collaborative task board. This is the front-end only, running on
mock data. It is the M1 milestone from the Group Project Brief: **Static
Front-End Skeleton**.

## What it is

React + Vite client for SyncBoard. Three columns (To Do / In Progress /
Done), add/move/delete tasks, per-task detail route, filter and search, and
all four UI states (loading, error, empty, success) — see the Group Project
Brief and Session 1 slides for the full spec this satisfies.

## How to run it

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

## Tech stack

- React 19 + Vite
- React Router (`react-router-dom`) for client-side routing
- CSS Modules for component styling
- No backend yet — `src/api/tasks.js` simulates one with an in-memory store
  and an artificial delay, so the loading state is real. Session 2 replaces
  the internals of that one file with real `fetch` calls; nothing else in
  the app changes.

## Folder conventions

```
src/
  api/         every network call, one file per resource — components never call fetch directly
  components/  presentational, reusable, no data fetching
  pages/       one component per route, composes components
  hooks/       shared stateful logic (useTasks, useFilters)
  context/     providers for app-wide state (TasksContext, FilterContext)
  utils/       pure helper functions (e.g. validate.js)
  data/        mock data — deleted once the API is live
```

Rules we're holding ourselves to:

- A component never calls `fetch` directly — it calls the `api` module.
- A page owns data; a component receives it as props.
- One component per file, named the same as the file.
- No component imports from `pages/`.
- If a file passes 200 lines, split it.

## Architecture

- **`TasksContext`** owns the task list via `useReducer` (`added` / `moved`
  / `deleted` / `loaded` actions) and talks to `src/api/tasks.js`. Consumed
  through the `useTasks()` hook — no prop drilling.
- **`FilterContext`** owns assignee/status/search filter state, backed by
  the URL's query string (`?status=doing&assignee=Nimali&q=login`) via
  `useSearchParams`, so filters are shareable and reflected in the URL as
  required. Consumed through `useFilters()`.
- **Routing**: `/` (board), `/tasks/:id` (task detail), `*` (404). Nav uses
  `<Link>`, never `<a href>`.

## Known limitations

- Data resets on every page reload — there is no real backend yet
  (Session 2) and no persistence layer yet (Session 3).
- No authentication yet — arrives in Session 2 with JWT.
- No real-time sync between browsers yet — arrives in Session 5.
- No automated tests yet — arrives in Session 4.

## Who did what

_Fill in per group member before submission — this line is part of the
grading rubric (Team Collaboration & Demo, 5%)._

| Member | Areas |
| --- | --- |
| _Name_ | _e.g. Board/Column/TaskCard, styling_ |
| _Name_ | _e.g. Routing, TaskDetailPage, 404_ |
| _Name_ | _e.g. Context/reducer, AddTaskForm, validation_ |
>>>>>>> 7241d09752ba80e8f88482fdc150acebfcd7f3ed
