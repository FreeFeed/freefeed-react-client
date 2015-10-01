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
