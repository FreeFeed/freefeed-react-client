import React from 'react'
import Linkify from'react-linkify'
import {showHtmlEnters} from '../utils'

const getEntered = text => <span dangerouslySetInnerHTML={{__html:showHtmlEnters(text)}}></span>

export default ({text}) => (<Linkify properties={{target: '_blank'}}>{getEntered(text)}</Linkify>)
