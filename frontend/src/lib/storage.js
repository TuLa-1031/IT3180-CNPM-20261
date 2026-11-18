// Local persistence used while the backend is read-only. Keys live here only.
const KEY = { user: 'bluemoon_user', data: 'bluemoon_data', users: 'bluemoon_users' }

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}
function remove(key) {
  try { localStorage.removeItem(key) } catch { /* noop */ }
}

export function loadState() {
  return {
    user: read(KEY.user),
    users: read(KEY.users),
    data: read(KEY.data)
  }
}

export function saveState({ data, users, user }) {
  write(KEY.data, data)
  write(KEY.users, users)
  if (user) write(KEY.user, user)
  else remove(KEY.user)
}
