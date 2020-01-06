import React from 'react';
import { setJSExceptionHandler } from 'react-native-exception-handler';
import { Provider, connect } from 'react-redux';
import { AppRegistry, Text, View, NativeModules } from 'react-native';
import {
  Lbry,
  buildSharedStateMiddleware,
  blockedReducer,
  claimsReducer,
  contentReducer,
  fileReducer,
  fileInfoReducer,
  notificationsReducer,
  publishReducer,
  searchReducer,
  tagsReducer,
  walletReducer,
  ACTIONS as LBRY_REDUX_ACTIONS,
} from 'lbry-redux';
import {
  Lbryio,
  authReducer,
  blacklistReducer,
  costInfoReducer,
  doGetSync,
  filteredReducer,
  homepageReducer,
  rewardsReducer,
  selectUserVerifiedEmail,
  statsReducer,
  subscriptionsReducer,
  syncReducer,
  userReducer,
  LBRYINC_ACTIONS,
} from 'lbryinc';
import { makeSelectClientSetting } from 'redux/selectors/settings';
import { createStore, applyMiddleware, compose } from 'redux';
import AppWithNavigationState, {
  AppNavigator,
  navigatorReducer,
  reactNavigationMiddleware,
} from 'component/AppNavigator';
import { REHYDRATE, PURGE, persistCombineReducers, persistStore } from 'redux-persist';
import { __ } from 'i18n';
import reactotron from '../reactotron';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import createCompressor from 'redux-persist-transform-compress';
import createFilter from 'redux-persist-transform-filter';
import moment from 'moment';
import formReducer from 'redux/reducers/form';
import drawerReducer from 'redux/reducers/drawer';
import settingsReducer from 'redux/reducers/settings';
import thunk from 'redux-thunk';

window.__ = __;

const globalExceptionHandler = (error, isFatal) => {
  if (error && NativeModules.Firebase) {
    NativeModules.Firebase.logException(!!isFatal, error.message ? error.message : 'No message', JSON.stringify(error));
  }
};
setJSExceptionHandler(globalExceptionHandler, true);

function isFunction(object) {
  return typeof object === 'function';
}

function isNotFunction(object) {
  return !isFunction(object);
}

function createBulkThunkMiddleware() {
  return ({ dispatch, getState }) => next => action => {
    if (action.type === 'BATCH_ACTIONS') {
      action.actions.filter(isFunction).map(actionFn => actionFn(dispatch, getState));
    }
    return next(action);
  };
}

function enableBatching(reducer) {
  return function batchingReducer(state, action) {
    switch (action.type) {
      case 'BATCH_ACTIONS':
        return action.actions.filter(isNotFunction).reduce(batchingReducer, state);
      default:
        return reducer(state, action);
    }
  };
}

const compressor = createCompressor();
const authFilter = createFilter('auth', ['authToken']);
const blockedFilter = createFilter('blocked', ['blockedChannels']);
const contentFilter = createFilter('content', ['positions']);
const saveClaimsFilter = createFilter('claims', ['claimsByUri']);
const subscriptionsFilter = createFilter('subscriptions', ['enabledChannelNotifications', 'subscriptions', 'latest']);
const settingsFilter = createFilter('settings', ['clientSettings']);
const tagsFilter = createFilter('tags', ['followedTags']);
const walletFilter = createFilter('wallet', ['receiveAddress']);

const v4PersistOptions = {
  whitelist: ['auth', 'blocked', 'claims', 'content', 'subscriptions', 'settings', 'tags', 'wallet'],
  // Order is important. Needs to be compressed last or other transforms can't
  // read the data
  transforms: [
    authFilter,
    blockedFilter,
    saveClaimsFilter,
    subscriptionsFilter,
    settingsFilter,
    walletFilter,
    compressor,
  ],
  debounce: 10000,
  storage: FilesystemStorage,
};

const persistOptions = Object.assign({}, v4PersistOptions, {
  key: 'primary',
  getStoredState: getStoredStateMigrateV4(v4PersistOptions),
});

const reducers = persistCombineReducers(persistOptions, {
  auth: authReducer,
  blacklist: blacklistReducer,
  blocked: blockedReducer,
  claims: claimsReducer,
  content: contentReducer,
  costInfo: costInfoReducer,
  drawer: drawerReducer,
  file: fileReducer,
  fileInfo: fileInfoReducer,
  filtered: filteredReducer,
  form: formReducer,
  homepage: homepageReducer,
  nav: navigatorReducer,
  notifications: notificationsReducer,
  publish: publishReducer,
  rewards: rewardsReducer,
  settings: settingsReducer,
  search: searchReducer,
  stats: statsReducer,
  subscriptions: subscriptionsReducer,
  sync: syncReducer,
  tags: tagsReducer,
  user: userReducer,
  wallet: walletReducer,
});

/**
 * source: the reducer name
 * property: the property in the reducer-specific state
 * transform: optional method to modify the value to be stored
 */
const sharedStateActions = [
  LBRYINC_ACTIONS.CHANNEL_SUBSCRIBE,
  LBRYINC_ACTIONS.CHANNEL_UNSUBSCRIBE,
  LBRY_REDUX_ACTIONS.CREATE_CHANNEL_COMPLETED,
  LBRY_REDUX_ACTIONS.TOGGLE_TAG_FOLLOW,
  LBRY_REDUX_ACTIONS.TOGGLE_BLOCK_CHANNEL,
];
const sharedStateFilters = {
  tags: { source: 'tags', property: 'followedTags' },
  subscriptions: {
    source: 'subscriptions',
    property: 'subscriptions',
    transform: function(value) {
      return value.map(({ uri }) => uri);
    },
  },
  blocked: { source: 'blocked', property: 'blockedChannels' },
};

const sharedStateCallback = ({ dispatch, getState }) => {
  const state = getState();
  const syncEnabled = makeSelectClientSetting(Constants.SETTING_DEVICE_WALLET_SYNCED)(state);
  const emailVerified = selectUserVerifiedEmail(state);
  if (syncEnabled && emailVerified) {
    NativeModules.UtilityModule.getSecureValue(Constants.KEY_WALLET_PASSWORD).then(password =>
      dispatch(doGetSync(password)),
    );
  }
};

const sharedStateMiddleware = buildSharedStateMiddleware(sharedStateActions, sharedStateFilters, sharedStateCallback);

const bulkThunk = createBulkThunkMiddleware();
const middleware = [sharedStateMiddleware, thunk, bulkThunk, reactNavigationMiddleware];

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = compose;

const store = createStore(
  enableBatching(reducers),
  {}, // initial state,
  composeEnhancers(applyMiddleware(...middleware), reactotron.createEnhancer()),
);
window.store = store;

const persistor = persistStore(store, null, err => {
  if (err) {
    console.log('Unable to load saved SETTINGS');
  }
});
window.persistor = persistor;

class LBRYApp extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppWithNavigationState />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('LBRYApp', () => LBRYApp);

export default LBRYApp;
