import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classnames from 'classnames'

import {unauthenticated} from '../redux/action-creators'
import Footer from './footer'
import Sidebar from './sidebar'
import LoaderContainer from './loader-container'

const InternalLayout = ({authenticated, children}) => (
  <div className={authenticated ? 'col-md-9' : 'col-md-12'}>
    <div className='content'>
      {children}
    </div>
  </div>
)


class Layout extends React.Component {
  // Here we have some handling of drag-n-drop, because standard dragenter
  // and dragleave events suck. Current implementation is using ideas from
  // Ben Smithett, see http://bensmithett.github.io/dragster/ for details

  constructor(props) {
    super(props)

    this.state = { isDragOver: false }

    this.handleDragEnter = this.handleDragEnter.bind(this)
    this.handleDragLeave = this.handleDragLeave.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
    this.handleDrop = this.handleDrop.bind(this)

    this.dragFirstLevel = false
    this.dragSecondLevel = false
  }

  containsFiles(e) {
    if (e.dataTransfer && e.dataTransfer.types) {
      // Event.dataTransfer.types is DOMStringList (not Array) in Firefox,
      // so we can't just use indexOf().
      for (let i=0; i<e.dataTransfer.types.length; i++) {
        if (e.dataTransfer.types[i] === 'Files') {
          return true
        }
      }
    }
    return false
  }

  handleDragEnter(e) {
    if (this.containsFiles(e)) {
      if (this.dragFirstLevel) {
        this.dragSecondLevel = true
        return
      }
      this.dragFirstLevel = true

      this.setState({ isDragOver: true })

      e.preventDefault()
    }
  }

  handleDragLeave(e) {
    if (this.containsFiles(e)) {
      if (this.dragSecondLevel) {
        this.dragSecondLevel = false
      } else if (this.dragFirstLevel) {
        this.dragFirstLevel = false
      }

      if (!this.dragFirstLevel && !this.dragSecondLevel) {
        this.setState({ isDragOver: false })
      }

      e.preventDefault()
    }
  }

  // Prevent browser from loading the file if user drops it outside of a dropzone
  // (both `handleDragOver` and `handleDrop` are necessary)
  handleDragOver(e) {
    if (this.containsFiles(e)) {
      e.preventDefault()
    }
  }
  handleDrop(e) {
    if (this.containsFiles(e)) {
      this.setState({ isDragOver: false })
      this.dragFirstLevel = false
      this.dragSecondLevel = false
      e.preventDefault()
    }
  }

  componentDidMount() {
    window.addEventListener('dragenter', this.handleDragEnter)
    window.addEventListener('dragleave', this.handleDragLeave)
    window.addEventListener('dragover', this.handleDragOver)
    window.addEventListener('drop', this.handleDrop)
  }

  componentWillUnmount() {
    window.removeEventListener('dragenter', this.handleDragEnter)
    window.removeEventListener('dragleave', this.handleDragLeave)
    window.removeEventListener('dragover', this.handleDragOver)
    window.removeEventListener('drop', this.handleDrop)
  }

  render() {
    let props = this.props

    let layoutClassNames = classnames({
      'container': true,
      'dragover': this.state.isDragOver
    })

    return (
      <div className={layoutClassNames}>
        <div className='row header-row'>
          <div className='col-md-4'>
            <div className='header'>
              <h1 className='title'>
                <Link to='/'>FreeFeed-beta</Link>
              </h1>
            </div>
          </div>

          <div className='col-md-8'>
            <div className='row'>
              <div className='col-md-6 search-field'>
                <div className='form-inline'>
                {/*<input className='form-control input-sm search-input p-search-input' />
                <button className='btn btn-default btn-sm p-search-action'>Search</button>*/}
                </div>
              </div>
              <div className='col-md-6'>
                {props.authenticated ? false : (
                  <div className='signin-toolbar'>
                    <Link to='/signin'>Sign In</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <LoaderContainer loading={props.loadingView} fullPage={true}>
          <div className='row'>
            <InternalLayout {...props}/>
            {props.authenticated ? <Sidebar {...props}/> : false}
          </div>
        </LoaderContainer>

        <div className='row'>
          <div className='col-md-12'>
          <Footer/>
          </div>
        </div>
      </div>
    )
  }
}

function select(state) {
  return {
    user: state.user,
    authenticated: state.authenticated,
    loadingView: state.routeLoadingState,
    recentGroups: state.recentGroups,
  }
}

function mapDispatchToProps(dispatch){
  return {
    signOut: ()=>dispatch(unauthenticated())
  }
}

export default connect(select, mapDispatchToProps)(Layout)
