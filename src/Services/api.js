import fetch from 'isomorphic-fetch'

const API_HOST = 'http://localhost:3000'

export function getWhoAmI(){
  return fetch(`${API_HOST}/v1/users/whoami`,{
    headers:{
      'Accept': 'application/json',
      'X-Authentication-Token': window.localStorage.getItem('authToken')
    }
  })
}

export function getHome({offset}) {
  return fetch(
    `${API_HOST}/v1/timelines/home?offset=${offset}`,
    {
      headers: {
        'Accept': 'application/json',
        'X-Authentication-Token': window.localStorage.getItem('authToken')
      }
    }
  )
}
