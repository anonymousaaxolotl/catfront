import { api } from '@/composables/api'

export default {
  login(data) {
    return api.post('/user/login', data)
  },
  create(data) {
    return api.post('/user', data)
  },
  Profile() {
    return api.get('/user/profile')
  },
  logout() {
    return api.delete('/user/logout')
  },
  buy(data) {
    return api.patch('/user/buy', data)
  },
  checkIn() {
    return api.patch('/user/checkin')
  },
  useItem(data) {
    return api.patch('/user/use', data)
  },
  getStats() {
    return api.get('/user/stats')
  },
  getAll() {
    return api.get('/user/all')
  },
  updateUser(id, data) {
    return api.patch('/user/' + id, data)
  },
  deleteUser(id) {
    return api.delete('/user/' + id)
  },
}
