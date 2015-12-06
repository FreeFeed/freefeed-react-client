import React from 'react'
import Linkify from'react-linkify'

const allButLast = arr => arr.slice(0, arr.length-1)

const brAndTrim = (text) => {
  const lines = text.split(/\n/g).map(line => line.trim()).filter(line=>line)
  const linesWithBrs = allButLast(lines).map((line, i) => <span key={i}>{line}<br/></span>)
  return [...linesWithBrs, lines[lines.length-1]]
}

const p = (text, i) => <p key={i}>{text}</p>

const getEntered = text => {
  if (!/\n/.test(text)){
    return text
  }
  const lines = text.split(/\n{2,}/g)
  .filter(line => line)
  .map(brAndTrim)

  const paragraphs = allButLast(lines).map(p)
  return [...paragraphs, lines[lines.length-1]]
}

export default ({text}) => (<Linkify properties={{target: '_blank'}}>{getEntered(text)}</Linkify>)
