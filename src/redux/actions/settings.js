import { ACTIONS } from 'lbry-redux';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api

export function doSetClientSetting(key, value) {
  return dispatch => {
    dispatch({
      type: ACTIONS.CLIENT_SETTING_CHANGED,
      data: {
        key,
        value,
      },
    });

    if (window.persistor) {
      window.persistor.flush();
    }
  };
}

export function doSetSortByItem(item) {
  return dispatch => {
    dispatch({
      type: Constants.ACTION_SORT_BY_ITEM_CHANGED,
      data: {
        name: item.name,
      },
    });
  };
}
