import { createStore } from 'redux'

const init = {
  token: localStorage.getItem('sys_token') || null,
  user:  JSON.parse(localStorage.getItem('sys_user') || 'null'),
  sidebarShow: true,
}

const reducer = (state = init, action) => {
  switch (action.type) {
    case 'login':
      localStorage.setItem('sys_token', action.token)
      localStorage.setItem('sys_user', JSON.stringify(action.user))
      return { ...state, token: action.token, user: action.user }
    case 'logout':
      localStorage.removeItem('sys_token')
      localStorage.removeItem('sys_user')
      return { ...state, token: null, user: null }
    case 'set':
      return { ...state, ...action }
    default:
      return state
  }
}

export default createStore(reducer)
