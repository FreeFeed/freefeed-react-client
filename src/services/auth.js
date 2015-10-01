import {getCookie, setCookie} from '../utils/'
import {auth as authConfig} from '../config'

const NAME = `${authConfig.tokenPrefix}authToken`
const EXP_DAYS = 365
const PATH = '/'

export function getToken(){
  return getCookie(NAME)
}

export function setToken(token){
  return setCookie(NAME, token, EXP_DAYS, PATH)
}

const USER_KEY = 'USER_KEY'

export function getPersistedUser(){
  return JSON.parse(window.localStorage.getItem(USER_KEY))
}

export function persistUser(user){
  return user ? window.localStorage.setItem(USER_KEY, JSON.stringify(user)) :
  window.localStorage.removeItem(USER_KEY)
}