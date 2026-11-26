// Lớp API mẫu cho một phân hệ. Khi tạo feature mới:
//   1. đổi RESOURCE thành key đã có trong lib/resources.js
//   2. giữ nguyên cách gọi apiClient, không tự viết fetch trong component
//   3. trả dữ liệu đã chuẩn hóa qua normalizeMany/normalizeOne
import { apiClient } from '../../lib/apiClient'
import { actionPath, actionMethod, entityPath, listPath, normalizeMany, normalizeOne } from '../../lib/resources'

const RESOURCE = 'feedbacks'

export const templateApi = {
  list: (params) => apiClient.request(listPath(RESOURCE, params)).then((payload) => normalizeMany(RESOURCE, payload)),
  get: (id) => apiClient.request(entityPath(RESOURCE, id)).then((payload) => normalizeOne(RESOURCE, payload)),
  create: (body) => apiClient.request(entityPath(RESOURCE), { method: 'POST', body })
    .then((payload) => normalizeOne(RESOURCE, payload)),
  update: (id, body) => apiClient.request(entityPath(RESOURCE, id), { method: 'PUT', body })
    .then((payload) => normalizeOne(RESOURCE, payload)),
  remove: (id) => apiClient.request(entityPath(RESOURCE, id), { method: 'DELETE' }),
  action: (action, id, body) => apiClient.request(actionPath(RESOURCE, action, id), {
    method: actionMethod(RESOURCE, action),
    body
  })
}
