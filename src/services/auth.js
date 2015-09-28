import {getCookie} from '../utils/'
import {auth as authConfig} from '../config'

const EXP_DAYS = 365
const PATH = '/'

export function getToken(){
  return getCookie(`${authConfig.tokenPrefix}authToken`)
}

export function setToken(token){
  const expiresTime = (new Date().setTime(d.getTime() + (EXP_DAYS * 24 * 60 * 60 * 1000))).toUTCString()
  const cookie = `${authConfig.tokenPrefix}authToken=${token};expires=${expiresTime};domain=${authConfig.cookieDomain};path=${PATH}`
  return document.cookie = cookie
}
