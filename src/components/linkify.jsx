import React from 'react'
import {Link} from 'react-router'
import URLFinder from 'ff-url-finder'
import config from '../config'

const MAX_URL_LENGTH = 50

const LINK = 'link'
const AT_LINK = 'atLink'
const LOCAL_LINK = 'localLink'
const EMAIL = 'email'

const finder = new URLFinder(
  ['ru', 'com', 'net', 'org', 'info', 'gov', 'edu', 'рф', 'ua'],
  config.siteDomains,
)

class Linkify extends React.Component {
  createLinkElement(type, displayedLink, href) {
    let props = { key: `match${++this.idx}` }

    if(type == AT_LINK || type == LOCAL_LINK) {
      props['to'] = href

      return React.createElement(
        Link,
        props,
        displayedLink
      )
    } else {
      props['href'] = href
      props['target'] = '_blank'

      return React.createElement(
        'a',
        props,
        displayedLink
      )
    }
  }

  parseCounter = 0

  parseString(string) {
    let elements = []
    if (string === '') {
      return elements
    }

    try {
      finder.parse(string).map(it => {
        let displayedLink
        let href

        if (it.type === LINK) {
          displayedLink = URLFinder.shorten(it.text, MAX_URL_LENGTH)
          href = it.url
        } else if (it.type === AT_LINK) {
          displayedLink = it.text
          href = `/${it.username}`
        } else if (it.type === LOCAL_LINK) {
          displayedLink = URLFinder.shorten(it.text, MAX_URL_LENGTH)
          href = it.uri
        } else if (it.type === EMAIL) {
          displayedLink = it.text
          href = `mailto:${it.address}`
        } else {
          elements.push(it.text)
          return
        }

        let linkElement = this.createLinkElement(it.type, displayedLink, href)

        elements.push(linkElement)
      })

      return (elements.length === 1) ? elements[0] : elements
    }
    catch(err){
      console.log('Error while liknifying text', string, err)
    }
    return [string]
  }

  parse(children) {
    let parsed = children

    if (typeof children === 'string') {
      parsed = this.parseString(children)
    } else if (React.isValidElement(children) && (children.type !== 'a') && (children.type !== 'button')) {
      parsed = React.cloneElement(
        children,
        {key: `parse${++this.parseCounter}`},
        this.parse(children.props.children)
      )
    } else if (children instanceof Array) {
      parsed = children.map(child => {
        return this.parse(child)
      })
    }

    return parsed
  }

  render() {
    this.parseCounter = 0
    const parsedChildren = this.parse(this.props.children)

    return <span className='Linkify'>{parsedChildren}</span>
  }
}

export default Linkify
