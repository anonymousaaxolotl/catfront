import { api } from '@/composables/api'

export const getAll = (params) => api.get('/product', { params })

export const create = (data) => api.post('/product', data)
export const update = (id, data) => api.patch('/product/' + id, data)
export const remove = (id) => api.delete('/product/' + id)

export default {
  getAll,
  create,
  update,
  remove,
}
