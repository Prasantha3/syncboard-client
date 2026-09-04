## SyncBoard

SyncBoard is a local-first collaborative task board built with the MERN stack (MongoDB, Express, React, Node.js) and PouchDB for client-side persistence and offline synchronization.

---

## Concurrency Strategy

SyncBoard utilizes **Optimistic Concurrency Control** via an incremental `version` field on the `Task` document schema.

* **Mechanism:** On update, `Task.findOneAndUpdate` matches both document `_id` and `version: baseVersion` while atomically incrementing `$inc: { version: 1 }`.
* **Conflict Handling:** If a write hits a mismatched `version` (indicating a lost update scenario), a `409 Conflict` response is thrown containing both the server's `current` state and the client's `yourVersion`.
* **Justification:** Optimistic concurrency avoids locking documents while remaining offline-friendly and preventing silent data overwrites.

---

## Data Model Decisions (Embed vs. Reference)

| Entity / Relationship | Decision | Justification |
| :--- | :--- | :--- |
| **Columns in Boards** | **Embedded** | Columns belong strictly to a single board and do not exist independently. Embedding minimizes additional database queries when retrieving a board. |
| **Tasks in Boards** | **Referenced** | Tasks can scale significantly per board. Referencing `boardId` in the `Task` document prevents reaching MongoDB's 16MB document size limit. |
| **Users in Tasks** | **Referenced** | `assigneeId` references the `User` document so user updates (e.g., name or email changes) reflect globally without unbounded duplication. |
| **Concurrency Control** | **Version Field** | Optimistic concurrency relies on the numerical `version` property in `Task` schema to catch and respond with `409 Conflict`. |

---

## API Endpoints & Postman Collection

The repository includes a pre-configured Postman Collection (`SyncBoard API.postman_collection.json`) covering standard board/task management, health checks, and concurrency testing.

* **Health Check:** `GET /api/health` — Returns server uptime and database connection status.
* **Overdue Tasks Aggregation:** `GET /api/tasks/stats/overdue` — Returns task count statistics grouped by assignee.
* **Conflict Simulation:** `PATCH /api/tasks/:id` — Passing an outdated `baseVersion` in the payload triggers an intentional `409 Conflict` response for testing client-side resolution modals.

---

## Local Setup & Development

### 1. Server Setup (`syncboard-server`)
```powershell
cd syncboard-server
npm install
npm run dev
