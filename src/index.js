import React from 'react';
import { setJSExceptionHandler } from 'react-native-exception-handler';
import { Provider, connect } from 'react-redux';
import { AppRegistry, Text, View, NativeModules } from 'react-native';
import {
  Lbry,
  claimsReducer,
  contentReducer,
  fileReducer,
  fileInfoReducer,
  notificationsReducer,
  publishReducer,
  searchReducer,
  tagsReducer,
  walletReducer,
} from 'lbry-redux';
import {
  Lbryio,
  authReducer,
  blacklistReducer,
  costInfoReducer,
  filteredReducer,
  homepageReducer,
  rewardsReducer,
  subscriptionsReducer,
  syncReducer,
  userReducer,
} from 'lbryinc';
import { createStore, applyMiddleware, compose } from 'redux';
import AppWithNavigationState, {
  AppNavigator,
  navigatorReducer,
  reactNavigationMiddleware,
} from 'component/AppNavigator';
import { REHYDRATE, PURGE, persistCombineReducers, persistStore } from 'redux-persist';
import getStoredStateMigrateV4 from 'redux-persist/lib/integration/getStoredStateMigrateV4';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import createCompressor from 'redux-persist-transform-compress';
import createFilter from 'redux-persist-transform-filter';
import moment from 'moment';
import formReducer from 'redux/reducers/form';
import drawerReducer from 'redux/reducers/drawer';
import settingsReducer from 'redux/reducers/settings';
import thunk from 'redux-thunk';
import isEqual from 'utils/deep-equal';

const globalExceptionHandler = (error, isFatal) => {
  if (error && NativeModules.Firebase) {
    NativeModules.Firebase.logException(isFatal, error.message ? error.message : 'No message', JSON.stringify(error));
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
const contentFilter = createFilter('content', ['positions']);
const saveClaimsFilter = createFilter('claims', ['claimsByUri']);
const subscriptionsFilter = createFilter('subscriptions', ['enabledChannelNotifications', 'subscriptions']);
const settingsFilter = createFilter('settings', ['clientSettings']);
const tagsFilter = createFilter('tags', ['followedTags']);
const walletFilter = createFilter('wallet', ['receiveAddress']);

const v4PersistOptions = {
  whitelist: ['auth', 'claims', 'content', 'subscriptions', 'settings', 'tags', 'wallet'],
  // Order is important. Needs to be compressed last or other transforms can't
  // read the data
  transforms: [authFilter, saveClaimsFilter, subscriptionsFilter, settingsFilter, walletFilter, compressor],
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
  subscriptions: subscriptionsReducer,
  sync: syncReducer,
  tags: tagsReducer,
  user: userReducer,
  wallet: walletReducer,
});

const bulkThunk = createBulkThunkMiddleware();
const middleware = [thunk, bulkThunk, reactNavigationMiddleware];

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = compose;

const store = createStore(
  enableBatching(reducers),
  {}, // initial state,
  composeEnhancers(applyMiddleware(...middleware))
);
window.store = store;

const persistor = persistStore(store, persistOptions, err => {
  if (err) {
    console.log('Unable to load saved SETTINGS');
  }
});
window.persistor = persistor;

let currentPayload;
store.subscribe(() => {
  const state = store.getState();
  const subscriptions = state.subscriptions.subscriptions.map(({ uri }) => uri);
  const tags = state.tags.followedTags;

  const newPayload = {
    version: '0.1',
    shared: {
      subscriptions,
      tags,
    },
  };

  if (!isEqual(newPayload, currentPayload)) {
    currentPayload = newPayload;
    if (Lbryio.authToken) {
      Lbryio.call('user_settings', 'set', { settings: JSON.stringify(newPayload) });
    }
  }
});

// TODO: Find i18n module that is compatible with react-native
global.__ = str => str;

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
