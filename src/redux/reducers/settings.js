import { ACTIONS } from 'lbry-redux';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api

const reducers = {};
const defaultState = {
  clientSettings: {},
  sdkReady: false,
  sortByItemName: Constants.SORT_BY_HOT,
  timeItemName: Constants.TIME_WEEK,
  fullscreenMode: false,
};

reducers[ACTIONS.CLIENT_SETTING_CHANGED] = (state, action) => {
  const { key, value } = action.data;
  const clientSettings = Object.assign({}, state.clientSettings);

  clientSettings[key] = value;

  return Object.assign({}, state, {
    clientSettings,
  });
};

reducers[Constants.ACTION_SDK_READY] = (state, action) =>
  Object.assign({}, state, {
    sdkReady: true,
  });

reducers[Constants.ACTION_SORT_BY_ITEM_CHANGED] = (state, action) =>
  Object.assign({}, state, {
    sortByItemName: action.data.name,
  });

reducers[Constants.ACTION_TIME_ITEM_CHANGED] = (state, action) =>
  Object.assign({}, state, {
    timeItemName: action.data.name,
  });

reducers[Constants.ACTION_FULLSCREEN_MODE_TOGGLED] = (state, action) =>
  Object.assign({}, state, {
    fullscreenMode: action.data.mode,
  });

export default function reducer(state = defaultState, action) {
  const handler = reducers[action.type];
  if (handler) return handler(state, action);
  return state;
}
