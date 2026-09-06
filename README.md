# SyncBoard

SyncBoard is a local-first collaborative task board built with the MERN stack (MongoDB, Express, React, Node.js) and PouchDB for client-side persistence and offline synchronization.

---

## 📊 Data Modeling & Architectural Decisions (Embed vs. Reference)

The database design balances document size limits, query performance, and write frequency using Mongoose with MongoDB. Below is the architectural justification for embedding vs. referencing entities across the application:

| Entity / Relationship | Decision | Justification |
| :--- | :--- | :--- |
| **Columns in Boards** | **Embedded** | Columns belong strictly to a single board and do not exist independently. Embedding minimizes additional database queries when retrieving a board and stays well under MongoDB's 16MB limit. |
| **Tasks in Boards** | **Referenced** | Tasks can scale significantly per board. Referencing `boardId` in the `Task` document prevents reaching MongoDB's 16MB document size limit and avoids write contention. |
| **Users in Tasks** | **Referenced** | `assigneeId` references the `User` document so user updates (e.g., name or email changes) reflect globally without unbounded data duplication. |
| **User Settings & Auth** | **Embedded** | User preferences, roles, and password hashes are embedded directly inside the `User` schema because they are bounded in scope and read together during authentication. |

---

## ⚡ Concurrency Strategy & Query Indexing

### Optimistic Concurrency Control (OCC)
SyncBoard utilizes Optimistic Concurrency Control via an incremental `version` field on the `Task` document schema.

* **Mechanism:** On update, `Task.findOneAndUpdate` matches both document `_id` and `version: baseVersion` while atomically incrementing `$inc: { version: 1 }`.
* **Conflict Handling:** If a write hits a mismatched `version` (indicating a lost update scenario), a `409 Conflict` response is thrown containing both the server's `current` state and the client's `yourVersion`.
* **Justification:** Optimistic concurrency avoids locking documents while remaining offline-friendly and preventing silent data overwrites.

### Query Indexing Strategy
To support high-throughput operations and aggregation pipelines, compound indexes are implemented on the `Task` collection:

* **Board Kanban View:** `taskSchema.index({ boardId: 1, status: 1, position: 1 })`
* **Overdue Task Analytics:** `taskSchema.index({ boardId: 1, dueDate: 1 })`
* **User Assignment Lookups:** `taskSchema.index({ assigneeId: 1, status: 1 })`

---

## 🚀 API Endpoints & Postman Collection

The repository includes a pre-configured Postman Collection (`SyncBoard API.postman_collection.json`) covering standard board/task management, health checks, and concurrency testing.

* **Health Check:** `GET /api/health` — Returns server uptime and database connection status (`connected`).
* **Overdue Tasks Aggregation:** `GET /api/tasks/stats/overdue` — Returns task count statistics grouped by assignee for tasks past their due date.
* **Conflict Simulation:** `PATCH /api/tasks/:id` — Passing an outdated `baseVersion` in the payload triggers an intentional `409 Conflict` response for testing client-side resolution modals.

---

## 🛠️ Local Setup & Execution

### Prerequisites
* **Node.js:** `v18.x` or higher
* **MongoDB:** Local instance running or MongoDB Atlas Connection URI

### 1. Backend Setup (`syncboard-server`)
```powershell
cd syncboard-server
npm install
