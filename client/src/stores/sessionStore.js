import { reactive, readonly } from 'vue'

const STORAGE_KEY = 'polywatch:user'

const state = reactive({
  user: loadSession()
})

function loadSession() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && parsed.id) {
      return {
        id: String(parsed.id),
        username: parsed.username || ''
      }
    }
  } catch (err) {
    console.warn('Failed to read session from storage', err)
  }
  return null
}

function persist(user) {
  if (user && user.id) {
    const normalized = {
      id: String(user.id),
      username: user.username || ''
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    state.user = normalized
  } else {
    clearUser()
  }
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY)
  state.user = null
}

function refresh() {
  state.user = loadSession()
}

function getStoredSession() {
  return loadSession()
}

export function useSessionStore() {
  return {
    session: readonly(state),
    setUser: persist,
    clearUser,
    refresh
  }
}

export { getStoredSession }
