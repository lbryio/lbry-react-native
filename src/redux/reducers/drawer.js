import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api

const reducers = {};
const defaultState = {
  stack: [{ route: Constants.DRAWER_ROUTE_SUBSCRIPTIONS, params: {} }], // Following is always the first drawer route
  lastRouteInStack: {},
  playerVisible: false,
  playerVisibleByUri: {},
  currentRoute: null,
};

reducers[Constants.ACTION_SET_PLAYER_VISIBLE] = (state, action) => {
  const { visible, uri } = action.data;
  const playerVisibleByUri = Object.assign({}, state.playerVisibleByUri);

  if (!uri) {
    Object.keys(playerVisibleByUri).forEach(playerUri => {
      playerVisibleByUri[playerUri] = visible;
    });
  } else {
    playerVisibleByUri[uri] = visible;
  }

  return Object.assign({}, state, {
    playerVisible: action.data.visible,
    playerVisibleByUri,
  });
};

reducers[Constants.ACTION_PUSH_DRAWER_STACK] = (state, action) => {
  const { routeName, params } = action.data;
  const newStack = state.stack.slice();

  const lastRoute = newStack[newStack.length - 1].route;
  let canPushStack = routeName !== lastRoute;
  if (
    lastRoute === Constants.DRAWER_ROUTE_CHANNEL_CREATOR_FORM &&
    routeName === Constants.DRAWER_ROUTE_CHANNEL_CREATOR
  ) {
    canPushStack = false;
  }
  if (lastRoute === Constants.DRAWER_ROUTE_PUBLISH_FORM && routeName === Constants.DRAWER_ROUTE_PUBLISH) {
    canPushStack = false;
  }
  if (routeName === Constants.DRAWER_ROUTE_SUBSCRIPTIONS && newStack.length === 1) {
    canPushStack = false;
  }

  let lastRouteInStack;
  if (canPushStack) {
    newStack.push({ route: routeName, params });

    // save the route
    lastRouteInStack = { route: routeName, params };
  }

  return {
    ...state,
    stack: newStack,
    lastRouteInStack,
  };
};

reducers[Constants.ACTION_POP_DRAWER_STACK] = (state, action) => {
  // We don't want to pop the Discover route, since it's always expected to be the first
  const newStack = state.stack.length === 1 ? state.stack.slice() : state.stack.slice(0, state.stack.length - 1);
  const lastRouteInStack = newStack && newStack.length > 0 ? newStack[newStack.length - 1] : null;

  return {
    ...state,
    stack: newStack,
    lastRouteInStack,
  };
};

// TODO: The ACTION_REACT_NAVIGATION_*** reducers are a workaround for the react
// navigation event listeners (willFocus, didFocus, etc) not working with the
// react-navigation-redux-helpers package.
reducers[Constants.ACTION_REACT_NAVGIATION_RESET] = (state, action) => {
  return {
    ...state,
    currentRoute: Constants.DRAWER_ROUTE_DISCOVER, // default to Discover upon reset
  };
};

reducers[Constants.ACTION_REACT_NAVIGATION_NAVIGATE] = (state, action) => {
  return {
    ...state,
    currentRoute: action.routeName,
  };
};

reducers[Constants.ACTION_REACT_NAVIGATION_REPLACE] = (state, action) => {
  return {
    ...state,
    currentRoute: action.routeName,
  };
};

export default function reducer(state = defaultState, action) {
  const handler = reducers[action.type];
  if (handler) return handler(state, action);
  return state;
}
