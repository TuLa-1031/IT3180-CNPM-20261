// Pure state transitions for local writes. When the backend gains write endpoints,
// App.commit is the single place that will call the API before applying these.
export function applyMutation(data, resource, mutation) {
  const list = data[resource] || []
  switch (mutation.type) {
    case 'create':
      return { ...data, [resource]: [...list, mutation.entity] }
    case 'update':
      return {
        ...data,
        [resource]: list.map((row) => (row.id === mutation.id ? { ...row, ...mutation.patch } : row))
      }
    default:
      return data
  }
}
