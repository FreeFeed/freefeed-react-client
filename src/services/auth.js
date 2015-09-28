import {getCookie} from '../utils/'

const config = {
  tokenPrefix: 'freefeed_',
  exdays: 365,
  domain:'localhost',
  path: '/',
}

export function getToken(){
  return getCookie(`${config.tokenPrefix}authToken`)
}

export function setToken(token){
  const expiresTime = (new Date().setTime(d.getTime() + (config.exdays * 24 * 60 * 60 * 1000))).toUTCString()
  const cookie = `${config.tokenPrefix}authToken=${token};expires=${expiresTime};domain=${config.domain};path=${config.path}`
  return document.cookie = cookie
}
