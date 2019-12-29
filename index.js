if (__DEV__) {
    import('./reactotron').then(() => console.log('Reactotron Configured'));
}

import LBRYApp from './src/index';

export default LBRYApp;
