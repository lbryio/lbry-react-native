import { ACTIONS } from 'lbry-redux';

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
