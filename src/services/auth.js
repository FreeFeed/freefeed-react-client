import {getCookie} from '../utils/'
import {auth as authConfig} from '../config'

const EXP_DAYS = 365
const PATH = '/'

export function getToken(){
  return getCookie(`${authConfig.tokenPrefix}authToken`)
}

export function setToken(token){
  const expiresDate = Date.now() + EXP_DAYS * 24 * 60 * 60 * 1000
  const expiresTime = new Date(expiresDate).toUTCString()
  //http://stackoverflow.com/questions/1134290/cookies-on-localhost-with-explicit-domain
  const cookie = `${authConfig.tokenPrefix}authToken=${token}; expires=${expiresTime}; path=${PATH}`
  document.cookie = cookie
}
