/* global CONFIG */
import { Component, Suspense } from 'react';
import { IndexLink, Link } from 'react-router';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import classnames from 'classnames';

import { faBug } from '@fortawesome/free-solid-svg-icons';
import { signOut, home } from '../redux/action-creators';
import { getCurrentRouteName } from '../utils';
import Footer from './footer';
import Sidebar from './sidebar';
import LoaderContainer from './loader-container';
import SearchForm from './search-form';
import ErrorBoundary from './error-boundary';
import { ColorSchemeSetter } from './color-theme-setter';
import { Icon, SVGSymbolDeclarations } from './fontawesome-icons';
import MediaViewer from './media-viewer';
import { Throbber } from './throbber';
import { Delayed } from './lazy-component';

const loadingPageMessage = (
  <Delayed>
    <div className="content">
      <div className="content">
        <div className="box">
          <div className="box-body">
            <p>
              Loading page... <Throbber />
            </p>
          </div>
        </div>
      </div>
    </div>
  </Delayed>
);

const InternalLayout = ({ authenticated, children }) => (
  <div className={authenticated ? 'col-md-9' : 'col-md-12'} role="main">
    <div className="content">
      <Suspense fallback={loadingPageMessage}>{children}</Suspense>
    </div>
  </div>
);

class Layout extends Component {
  // Here we have some handling of drag-n-drop, because standard dragenter
  // and dragleave events suck. Current implementation is using ideas from
  // Ben Smithett, see http://bensmithett.github.io/dragster/ for details

  constructor(props) {
    super(props);

    this.state = { isDragOver: false };

    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);

    this.dragFirstLevel = false;
    this.dragSecondLevel = false;
  }

  containsFiles(e) {
    if (e.dataTransfer && e.dataTransfer.types) {
      // Event.dataTransfer.types is DOMStringList (not Array) in Firefox,
      // so we can't just use indexOf().
      for (let i = 0; i < e.dataTransfer.types.length; i++) {
        if (e.dataTransfer.types[i] === 'Files') {
          return true;
        }
      }
    }
    return false;
  }

  handleDragEnter(e) {
    if (this.containsFiles(e)) {
      if (this.dragFirstLevel) {
        this.dragSecondLevel = true;
        return;
      }
      this.dragFirstLevel = true;

      this.setState({ isDragOver: true });

      e.preventDefault();
    }
  }

  handleDragLeave(e) {
    if (this.containsFiles(e)) {
      if (this.dragSecondLevel) {
        this.dragSecondLevel = false;
      } else if (this.dragFirstLevel) {
        this.dragFirstLevel = false;
      }

      if (!this.dragFirstLevel && !this.dragSecondLevel) {
        this.setState({ isDragOver: false });
      }

      e.preventDefault();
    }
  }

  // Prevent browser from loading the file if user drops it outside of a dropzone
  // (both `handleDragOver` and `handleDrop` are necessary)
  handleDragOver(e) {
    if (this.containsFiles(e)) {
      e.preventDefault();
    }
  }
  handleDrop(e) {
    if (this.containsFiles(e)) {
      this.setState({ isDragOver: false });
      this.dragFirstLevel = false;
      this.dragSecondLevel = false;
      e.preventDefault();
    }
  }

  componentDidMount() {
    window.addEventListener('dragenter', this.handleDragEnter);
    window.addEventListener('dragleave', this.handleDragLeave);
    window.addEventListener('dragover', this.handleDragOver);
    window.addEventListener('drop', this.handleDrop);
  }

  componentWillUnmount() {
    window.removeEventListener('dragenter', this.handleDragEnter);
    window.removeEventListener('dragleave', this.handleDragLeave);
    window.removeEventListener('dragover', this.handleDragOver);
    window.removeEventListener('drop', this.handleDrop);
  }

  render() {
    const { props } = this;

    const layoutClassNames = classnames('container', { dragover: this.state.isDragOver });

    let signInLink = '/signin';
    const { location } = props.router;
    if (location.pathname === '/signin') {
      signInLink += location.search;
    } else if (location.pathname !== '/') {
      signInLink += `?back=${encodeURIComponent(location.pathname + location.search)}`;
    }

    return (
      <div className={layoutClassNames}>
        <ErrorBoundary>
          <Helmet title={props.title} defer={false} />
          <ColorSchemeSetter />
          <SVGSymbolDeclarations />

          <header className="row">
            <div className="col-xs-9 col-sm-4 col-md-4">
              <h1 className="site-logo">
                <IndexLink className="site-logo-link" to="/">
                  {CONFIG.siteTitle}
                </IndexLink>
                {CONFIG.betaChannel.enabled && CONFIG.betaChannel.isBeta && (
                  <Link to="/settings/appearance#beta" className="site-logo-subheading">
                    {CONFIG.betaChannel.subHeading}
                  </Link>
                )}
              </h1>
            </div>

            {props.authenticated ? (
              <div className="col-xs-12 col-sm-8 hidden-md hidden-lg" role="complementary">
                <div className="mobile-shortcuts" role="navigation">
                  <Link className="mobile-shortcut-link" to="/filter/discussions">
                    Discussions
                  </Link>
                  <Link className="mobile-shortcut-link" to="/filter/notifications">
                    Notifications
                    {props.user.unreadNotificationsNumber > 0 &&
                      !props.user.frontendPreferences.hideUnreadNotifications &&
                      ` (${props.user.unreadNotificationsNumber})`}
                  </Link>
                  <Link className="mobile-shortcut-link" to="/filter/direct">
                    Directs
                    {props.user.unreadDirectsNumber > 0 && ` (${props.user.unreadDirectsNumber})`}
                  </Link>
                  <Link className="mobile-shortcut-link" to={`/${props.user.username}`}>
                    My feed
                  </Link>
                </div>
              </div>
            ) : (
              <div className="col-xs-3 col-sm-6 col-md-3 text-right" role="complementary">
                <div className="signin-link">
                  <Link to={signInLink}>Sign In</Link>
                </div>
              </div>
            )}

            <div className="col-xs-12 col-sm-12 col-md-5">
              <SearchForm />
            </div>
          </header>

          <LoaderContainer loading={props.loadingView} fullPage>
            <div className="row">
              <InternalLayout {...props} />
              {props.authenticated ? <Sidebar {...props} /> : false}
            </div>
          </LoaderContainer>

          <MediaViewer />

          <div className="row">
            <div className="col-md-12">
              <Footer />
            </div>
          </div>

          {CONFIG.betaChannel.enabled && CONFIG.betaChannel.isBeta && (
            <a href="/support" target="_blank" className="bug-report-link" title="Report a bug">
              <Icon icon={faBug} />
            </a>
          )}
        </ErrorBoundary>
      </div>
    );
  }
}

function select(state, ownProps) {
  return {
    user: state.user,
    authenticated: state.authenticated,
    loadingView: state.routeLoadingState,
    routeName: getCurrentRouteName(ownProps),
    title: state.title,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    signOut: () => dispatch(signOut()),
    home: () => dispatch(home()),
  };
}

export default connect(select, mapDispatchToProps)(Layout);
