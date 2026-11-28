import { apiClient } from '../../lib/apiClient'
import { listPath, normalizeMany } from '../../lib/resources'

export const householdsApi = {
  list: (params) => apiClient.request(listPath('households', params))
    .then((payload) => normalizeMany('households', payload))
}

export const residentsApi = {
  list: (params) => apiClient.request(listPath('residents', params))
    .then((payload) => normalizeMany('residents', payload))
}

export const residenceChangesApi = {
  list: (params) => apiClient.request(listPath('residenceChanges', params))
    .then((payload) => normalizeMany('residenceChanges', payload))
}
