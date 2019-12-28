import { lazyComponent } from './lazy-component';

export default lazyComponent(() => import(/* webpackPrefetch: true */ './dropzone-component'), {
  errorMessage: 'Cannot load Dropzone component',
});
