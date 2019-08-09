import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api

export const doPushDrawerStack = (routeName, params) => dispatch =>
  dispatch({
    type: Constants.ACTION_PUSH_DRAWER_STACK,
    data: { routeName, params },
  });

export const doPopDrawerStack = () => dispatch =>
  dispatch({
    type: Constants.ACTION_POP_DRAWER_STACK,
  });

export const doSetPlayerVisible = visible => dispatch =>
  dispatch({
    type: Constants.ACTION_SET_PLAYER_VISIBLE,
    data: { visible },
  });
