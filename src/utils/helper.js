import { NavigationActions, StackActions } from 'react-navigation';
import { buildURI, isURIValid, normalizeURI } from 'lbry-redux';
import { Lbryio } from 'lbryinc';
import { doPopDrawerStack, doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import Constants, { DrawerRoutes, InnerDrawerRoutes } from 'constants'; // eslint-disable-line node/no-deprecated-api

const tagNameLength = 10;

const specialRouteMap = {
  about: Constants.DRAWER_ROUTE_ABOUT,
  allContent: Constants.DRAWER_ROUTE_TRENDING,
  channels: Constants.DRAWER_ROUTE_CHANNEL_CREATOR,
  invite: Constants.DRAWER_ROUTE_INVITES,
  invites: Constants.DRAWER_ROUTE_INVITES,
  library: Constants.DRAWER_ROUTE_MY_LBRY,
  publish: Constants.DRAWER_ROUTE_PUBLISH,
  publishes: Constants.DRAWER_ROUTE_PUBLISHES,
  rewards: Constants.DRAWER_ROUTE_REWARDS,
  settings: Constants.DRAWER_ROUTE_SETTINGS,
  subscriptions: Constants.DRAWER_ROUTE_SUBSCRIPTIONS,
  wallet: Constants.FULL_ROUTE_NAME_WALLET,
  discover: Constants.FULL_ROUTE_NAME_DISCOVER,
};

function getRouteForSpecialUri(uri) {
  let targetRoute;
  const page = uri.substring(8).trim(); // 'lbry://?'.length == 8

  if (specialRouteMap[page]) {
    targetRoute = specialRouteMap[page];
  }

  if (!targetRoute) {
    // default to the home page if there is no match for the page
    targetRoute = Constants.FULL_ROUTE_NAME_DISCOVER;
  }

  return targetRoute;
}

export function dispatchNavigateToUri(dispatch, nav, uri, isNavigatingBack, fullUri) {
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

  const params = { uri, uriVars, fullUri: fullUri };

  if (!isNavigatingBack) {
    dispatch(doPushDrawerStack(uri));
  }

  dispatch(doSetPlayerVisible(false));

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

export function navigateToUri(
  navigation,
  uri,
  additionalParams,
  isNavigatingBack,
  fullUri,
  setPlayerVisible,
  pushStack = false,
) {
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

  if (setPlayerVisible) {
    setPlayerVisible(false);
  }

  const { store } = window;
  const params = Object.assign({ uri, uriVars, fullUri: fullUri }, additionalParams);
  if (navigation.state.routeName === 'File') {
    const stackAction = StackActions.replace({ routeName: 'File', newKey: uri, params });
    navigation.dispatch(stackAction);
    if (store && store.dispatch && !isNavigatingBack) {
      store.dispatch(doPushDrawerStack(uri));
    }
    return;
  }

  navigation.navigate({ routeName: 'File', key: uri, params });
  if (pushStack && store && store.dispatch && !isNavigatingBack) {
    store.dispatch(doPushDrawerStack(uri));
  }
}

export function navigateBack(navigation, drawerStack, popDrawerStack, setPlayerVisible) {
  if (drawerStack[drawerStack.length - 1].route === Constants.DRAWER_ROUTE_FILE_VIEW) {
    // inner file_view (web / image view) is handled differently
    if (popDrawerStack) {
      popDrawerStack();
    }
    return;
  }

  if (popDrawerStack) {
    popDrawerStack();
  }

  if (setPlayerVisible) {
    setPlayerVisible(false);
  }

  const target = drawerStack[drawerStack.length > 1 ? drawerStack.length - 2 : 0];
  const { route, params } = target;
  navigation.goBack(navigation.state.key);

  if (!DrawerRoutes.includes(route) && !InnerDrawerRoutes.includes(route) && isURIValid(route)) {
    navigateToUri(navigation, route, null, true, null, setPlayerVisible);
  } else {
    let targetRoute = route;
    let targetParams = params;
    if (InnerDrawerRoutes.includes(route)) {
      if (Constants.DRAWER_ROUTE_CHANNEL_CREATOR_FORM === route) {
        targetRoute = Constants.DRAWER_ROUTE_CHANNEL_CREATOR;
      } else if (Constants.DRAWER_ROUTE_PUBLISH_FORM === route) {
        targetRoute = Constants.DRAWER_ROUTE_PUBLISH;
      }

      if (targetParams) {
        targetParams.displayForm = true;
      } else {
        targetParams = { displayForm: true };
      }
    }

    navigation.navigate({ routeName: targetRoute, targetParams });
  }
}

export function dispatchNavigateBack(dispatch, nav, drawerStack) {
  const currentRoute = drawerStack[drawerStack.length - 1].route;
  if (
    [
      Constants.DRAWER_ROUTE_FILE_VIEW,
      Constants.DRAWER_ROUTE_CHANNEL_CREATOR_FORM,
      Constants.DRAWER_ROUTE_PUBLISH_FORM,
    ].includes(currentRoute)
  ) {
    // inner routes are handled a little differently
    dispatch(doPopDrawerStack());
    return;
  }

  dispatch(doPopDrawerStack());
  dispatch(doSetPlayerVisible(false));

  const target = drawerStack[drawerStack.length > 1 ? drawerStack.length - 2 : 0];
  const { route } = target;
  dispatch(NavigationActions.back());
  if (!DrawerRoutes.includes(route) && !InnerDrawerRoutes.includes(route) && isURIValid(route)) {
    dispatchNavigateToUri(dispatch, nav, route, true);
  } else {
    const newTarget = drawerStack[drawerStack.length > 1 ? drawerStack.length - 2 : 0];
    let targetRoute = newTarget.route;
    let targetParams = newTarget.params;
    if (InnerDrawerRoutes.includes(targetRoute)) {
      if (Constants.DRAWER_ROUTE_CHANNEL_CREATOR_FORM === route) {
        targetRoute = Constants.DRAWER_ROUTE_CHANNEL_CREATOR;
      } else if (Constants.DRAWER_ROUTE_PUBLISH_FORM === route) {
        targetRoute = Constants.DRAWER_ROUTE_PUBLISH;
      }

      if (targetParams) {
        targetParams.displayForm = true;
      } else {
        targetParams = { displayForm: true };
      }
    }

    const navigateAction = NavigationActions.navigate({
      routeName: targetRoute,
      params: targetParams,
    });

    dispatch(navigateAction);
  }
}

export function uriFromFileInfo(fileInfo) {
  const { name: claimName, claim_name: claimNameDownloaded, claim_id: claimId } = fileInfo;
  const uriParams = {};
  uriParams.claimName = claimName || claimNameDownloaded;
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

export function getTimeItemForName(name) {
  for (let i = 0; i < Constants.CLAIM_SEARCH_TIME_ITEMS.length; i++) {
    if (name === Constants.CLAIM_SEARCH_TIME_ITEMS[i].name) {
      return Constants.CLAIM_SEARCH_TIME_ITEMS[i];
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

// replace occurrences of ':' with '#' in a url (entered in the URI bar)
export function transformUrl(url) {
  const start = 'lbry://'.length;
  return normalizeURI(url.substring(start).replace(/:/g, '#'));
}

// i18n placeholder until we find a good react-native i18n module
export function __(str) {
  return str;
}

export function logPublish(claimResult) {
  // eslint-disable-next-line no-undef
  if (!__DEV__) {
    const { permanent_url: uri, claim_id: claimId, txid, nout, signing_channel: signingChannel } = claimResult;
    let channelClaimId;
    if (signingChannel) {
      channelClaimId = signingChannel.claim_id;
    }
    const outpoint = `${txid}:${nout}`;
    const params = { uri, claim_id: claimId, outpoint };
    if (channelClaimId) {
      params['channel_claim_id'] = channelClaimId;
    }
    Lbryio.call('event', 'publish', params);
  }
}

export function uploadImageAsset(filePath, success, failure) {
  const makeid = () => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 24; i += 1) text += possible.charAt(Math.floor(Math.random() * 62));
    return text;
  };

  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  let fileExt = fileName.indexOf('.') > -1 ? fileName.substring(fileName.lastIndexOf('.') + 1).trim() : 0;
  if (!fileExt) {
    fileExt = 'jpg'; // default to jpg
  }
  const fileType = `image/${fileExt}`;

  const data = new FormData();
  const name = makeid();
  data.append('name', name);
  data.append('file', { uri: 'file://' + filePath, type: fileType, name: fileName });

  return fetch('https://spee.ch/api/claim/publish', {
    method: 'POST',
    body: data,
  })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        if (success) {
          success({ url: `${json.data.url}.${fileExt}` });
        }
      }
    })
    .catch(err => {
      if (failure) {
        failure(err.message ? err.message : 'The image failed to upload.');
      }
    });
}

// TODO: Move this to lbry-redux
export function formatLbryUrlForWeb(url) {
  return url.replace('lbry://', '/').replace(/#/g, ':');
}

export function getDownloadProgress(fileInfo) {
  return Math.ceil((fileInfo.written_bytes / fileInfo.total_bytes) * 100);
}

export function getStorageForFileInfo(fileInfo) {
  if (!fileInfo.completed) {
    const written = formatBytes(fileInfo.written_bytes);
    const total = formatBytes(fileInfo.total_bytes);
    return `(${written} / ${total})`;
  }

  return formatBytes(fileInfo.written_bytes);
}

export function formatTitle(title) {
  if (!title) {
    return title;
  }

  return title.length > 80 ? title.substring(0, 77).trim() + '...' : title;
}

export function fetchReferralCode(successCallback, errorCallback) {
  Lbryio.call('user_referral_code', 'list')
    .then(response => {
      if (successCallback) {
        successCallback(response);
      }
    })
    .catch(err => {
      if (errorCallback) {
        errorCallback(err);
      }
    });
}

export function decode(value) {
  return decodeURIComponent(value).replace(/\+/g, ' ');
}
