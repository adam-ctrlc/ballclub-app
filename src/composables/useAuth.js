import { computed, ref } from 'vue'

const token = ref(localStorage.getItem('token'))

function login(newToken) {
  token.value = newToken
  localStorage.setItem('token', newToken)
}

function logout() {
  token.value = null
  localStorage.removeItem('token')
}

const isAuthenticated = computed(() => !!token.value)

export function useAuth() {
  return { token, isAuthenticated, login, logout }
}
