import { mockTasks } from '../data/mockTasks'

// In-memory store standing in for the database. Components never touch this
// directly or call fetch — they only ever import the named functions below.
let store = [...mockTasks]

const DELAY_MS = 500

function delay(ms = DELAY_MS) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export async function getTasks() {
  await delay()
  return clone(store)
}

export async function getTaskById(id) {
  await delay()
  const task = store.find(t => t.id === id)
  if (!task) {
    throw new Error(`No task found with id "${id}"`)
  }
  return clone(task)
}

export async function createTask(task) {
  await delay()
  const newTask = {
    id: crypto.randomUUID(),
    status: 'todo',
    ...task,
  }
  store = [...store, newTask]
  return clone(newTask)
}

export async function updateTaskStatus(id, status) {
  await delay()
  store = store.map(t => (t.id === id ? { ...t, status } : t))
  return clone(store.find(t => t.id === id))
}

export async function deleteTask(id) {
  await delay()
  store = store.filter(t => t.id !== id)
  return { id }
}
