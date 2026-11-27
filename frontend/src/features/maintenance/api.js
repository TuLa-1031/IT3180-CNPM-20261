import { apiClient } from '../../lib/apiClient'
import { actionMethod, actionPath, entityPath, listPath, normalizeMany, normalizeOne } from '../../lib/resources'

const createResourceApi = (resource) => ({
  list: (params) => apiClient.request(listPath(resource, params)).then((payload) => normalizeMany(resource, payload)),
  get: (id) => apiClient.request(entityPath(resource, id)).then((payload) => normalizeOne(resource, payload)),
  create: (body) => apiClient.request(entityPath(resource), { method: 'POST', body })
    .then((payload) => normalizeOne(resource, payload)),
  update: (id, body) => apiClient.request(entityPath(resource, id), { method: 'PUT', body })
    .then((payload) => normalizeOne(resource, payload)),
  remove: (id) => apiClient.request(entityPath(resource, id), { method: 'DELETE' }),
  action: (action, id, body) => apiClient.request(actionPath(resource, action, id), {
    method: actionMethod(resource, action),
    body
  })
})

export const equipmentApi = createResourceApi('equipment')
export const scheduleApi = createResourceApi('maintenanceSchedules')
export const taskApi = createResourceApi('maintenanceTasks')
export const technicianApi = createResourceApi('technicians')
