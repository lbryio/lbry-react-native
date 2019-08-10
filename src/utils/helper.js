import { NavigationActions, StackActions } from 'react-navigation';
import { buildURI, isURIValid } from 'lbry-redux';
import { doPopDrawerStack, doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import Constants, { DrawerRoutes } from 'constants'; // eslint-disable-line node/no-deprecated-api

const tagNameLength = 10;

function getRouteForSpecialUri(uri) {
  let targetRoute;
  const page = uri.substring(8).trim(); // 'lbry://?'.length == 8

  switch (page) {
    case Constants.PAGE_REWARDS:
      targetRoute = 'Rewards';
      break;
    case Constants.PAGE_SETTINGS:
      targetRoute = 'Settings';
      break;
    case Constants.PAGE_TRENDING:
      targetRoute = 'TrendingStack';
      break;
    case Constants.PAGE_WALLET:
      targetRoute = 'WalletStack';
      break;
    default:
      targetRoute = 'DiscoverStack';
      break;
  }

  return targetRoute;
}

export function dispatchNavigateToUri(dispatch, nav, uri, isNavigatingBack) {
  if (uri.startsWith('lbry://?')) {
    dispatch(NavigationActions.navigate({ routeName: getRouteForSpecialUri(uri) }));
    return;
  }

  let uriVars = {},
    uriVarsStr;
  if (uri.indexOf('?') > -1) {
    uriVarsStr = uri.substring(uri.indexOf('?') + 1);
    uri = uri.substring(0, uri.indexOf('?'));
    uriVars = parseUriVars(uriVarsStr);
  }

  const params = { uri, uriVars };

  if (!isNavigatingBack) {
    dispatch(doPushDrawerStack(uri));
    dispatch(doSetPlayerVisible(true));
  }

  if (nav && nav.routes && nav.routes.length > 0 && nav.routes[0].routeName === 'Main') {
    const mainRoute = nav.routes[0];
    const discoverRoute = mainRoute.routes[0];
    if (discoverRoute.index > 0 && discoverRoute.routes[discoverRoute.index].routeName === 'File') {
      const fileRoute = discoverRoute.routes[discoverRoute.index];
      // Currently on a file page, so we can ignore (if the URI is the same) or replace (different URIs)
      if (uri !== fileRoute.params.uri) {
        const stackAction = StackActions.replace({ routeName: 'File', newKey: uri, params });
        dispatch(stackAction);
        return;
      }
    }
  }

  const navigateAction = NavigationActions.navigate({ routeName: 'File', key: uri, params });
  dispatch(navigateAction);
}

export function formatBytes(bytes, decimalPoints = 0) {
  if (!bytes) {
    return '0 KB';
  }

  if (bytes < 1048576) {
    // < 1MB
    const value = (bytes / 1024.0).toFixed(decimalPoints);
    return `${value} KB`;
  }

  if (bytes < 1073741824) {
    // < 1GB
    const value = (bytes / (1024.0 * 1024.0)).toFixed(decimalPoints);
    return `${value} MB`;
  }

  const value = (bytes / (1024.0 * 1024.0 * 1024.0)).toFixed(decimalPoints);
  return `${value} GB`;
}

function parseUriVars(vars) {
  const uriVars = {};
  const parts = vars.split('&');
  for (let i = 0; i < parts.length; i++) {
    const str = parts[i];
    if (str.indexOf('=') > -1) {
      const key = str.substring(0, str.indexOf('='));
      const value = str.substring(str.indexOf('=') + 1);
      uriVars[key] = value;
    } else {
      uriVars[str] = null;
    }
  }

  return uriVars;
}

export function navigateToUri(navigation, uri, additionalParams, isNavigatingBack) {
  if (!navigation) {
    return;
  }

  if (uri === navigation.state.key) {
    return;
  }

  if (uri.startsWith('lbry://?')) {
    navigation.navigate({ routeName: getRouteForSpecialUri(uri) });
    return;
  }

  let uriVars = {},
    uriVarsStr;
  if (uri.indexOf('?') > -1) {
    uriVarsStr = uri.substring(uri.indexOf('?') + 1);
    uri = uri.substring(0, uri.indexOf('?'));
    uriVars = parseUriVars(uriVarsStr);
  }

  const { store } = window;
  const params = Object.assign({ uri, uriVars }, additionalParams);
  if (navigation.state.routeName === 'File') {
    const stackAction = StackActions.replace({ routeName: 'File', newKey: uri, params });
    navigation.dispatch(stackAction);
    if (store && store.dispatch && !isNavigatingBack) {
      store.dispatch(doPushDrawerStack(uri));
      store.dispatch(doSetPlayerVisible(true));
    }
    return;
  }

  navigation.navigate({ routeName: 'File', key: uri, params });
  if (store && store.dispatch && !isNavigatingBack) {
    store.dispatch(doPushDrawerStack(uri));
    store.dispatch(doSetPlayerVisible(true));
  }
}

export function navigateBack(navigation, drawerStack, popDrawerStack) {
  if (popDrawerStack) {
    popDrawerStack();
  }

  const target = drawerStack[drawerStack.length > 1 ? drawerStack.length - 2 : 0];
  const { route, params } = target;
  navigation.goBack(navigation.state.key);
  if (DrawerRoutes.indexOf(route) === -1 && isURIValid(route)) {
    navigateToUri(navigation, route, null, true);
  } else {
    navigation.navigate({ routeName: route, params });
  }
}

export function dispatchNavigateBack(dispatch, nav, drawerStack) {
  dispatch(doPopDrawerStack());

  const target = drawerStack[drawerStack.length > 1 ? drawerStack.length - 2 : 0];
  const { route } = target;
  dispatch(NavigationActions.back());
  if (DrawerRoutes.indexOf(route) === -1 && isURIValid(route)) {
    dispatchNavigateToUri(dispatch, nav, route, true);
  } else {
    const newTarget = drawerStack[drawerStack.length > 1 ? drawerStack.length - 2 : 0];
    const navigateAction = NavigationActions.navigate({
      routeName: newTarget.route,
      params: newTarget.params,
    });
    dispatch(navigateAction);
  }
}

export function uriFromFileInfo(fileInfo) {
  const { name: claimName, claim_name: claimNameDownloaded, claim_id: claimId } = fileInfo;
  const uriParams = {};
  uriParams.contentName = claimName || claimNameDownloaded;
  uriParams.claimId = claimId;
  return buildURI(uriParams);
}

export function formatTagTitle(title) {
  if (!title) {
    return null;
  }
  return title.charAt(0).toUpperCase() + title.substring(1);
}

export function formatTagName(name) {
  if (!name) {
    return null;
  }
  if (name.length <= tagNameLength) {
    return name;
  }

  return name.substring(0, 7) + '...';
}

export function getSortByItemForName(name) {
  for (let i = 0; i < Constants.CLAIM_SEARCH_SORT_BY_ITEMS.length; i++) {
    if (name === Constants.CLAIM_SEARCH_SORT_BY_ITEMS[i].name) {
      return Constants.CLAIM_SEARCH_SORT_BY_ITEMS[i];
    }
  }

  return null;
}

export function getOrderBy(item) {
  let orderBy = [];
  switch (item.name) {
    case Constants.SORT_BY_HOT:
      orderBy = Constants.DEFAULT_ORDER_BY;
      break;

    case Constants.SORT_BY_NEW:
      orderBy = ['release_time'];
      break;

    case Constants.SORT_BY_TOP:
      orderBy = [Constants.ORDER_BY_EFFECTIVE_AMOUNT];
      break;
  }

  return orderBy;
}

// i18n placeholder until we find a good react-native i18n module
export function __(str) {
  return str;
}
