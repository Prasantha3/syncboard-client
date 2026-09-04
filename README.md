# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Concurrency Strategy

SyncBoard utilizes **Optimistic Concurrency Control** via an incremental `version` field on the `Task` document schema.

* **Mechanism:** On update, `Task.findOneAndUpdate` matches both document `_id` and `version: baseVersion` while atomically incrementing `$inc: { version: 1 }`.
* **Conflict Handling:** If a write hits a mismatched `version` (indicating a lost update scenario), a `409 Conflict` response is thrown containing both the server's `current` state and the client's `yourVersion`.
* **Justification:** Optimistic concurrency avoids locking documents while remaining offline-friendly and preventing silent data overwrites.
