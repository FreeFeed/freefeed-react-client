import Loadable from 'react-loadable';


export default Loadable({
  loading: ({ error }) => (error && <div>Cannot load Dropzone component</div>),
  loader:  () => import('./dropzone-component'),
});
