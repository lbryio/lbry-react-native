// @flow
import { NativeModules } from 'react-native';
import {
  ACTIONS,
  batchActions,
  buildURI,
  doResolveUri,
  doUpdateSearchQuery,
  makeSelectSearchUris,
  selectSuggestions,
  makeSelectQueryWithOptions,
  selectSearchValue,
} from 'lbry-redux';

let CONNECTION_STRING = 'https://lighthouse.lbry.com/';

const handleNativeFetchResponse = str => {
  const json = JSON.parse(str);
  if (json.error) {
    return Promise.reject(new Error(json.error));
  }

  return Promise.resolve(json);
};

// Use a native asyncTask to call the lighthouse api
export const doNativeSearch = (
  rawQuery: string, // pass in a query if you don't want to search for what's in the search bar
  size: ?number, // only pass in if you don't want to use the users setting (ex: related content)
  from: ?number,
  isBackgroundSearch: boolean = false
) => (dispatch: Dispatch, getState: GetState) => {
  const query = rawQuery.replace(/^lbry:\/\//i, '').replace(/\//, ' ');

  if (!query) {
    dispatch({
      type: ACTIONS.SEARCH_FAIL,
    });
    return;
  }

  const state = getState();
  const queryWithOptions = makeSelectQueryWithOptions(query, size, from, isBackgroundSearch)(state);

  // If we have already searched for something, we don't need to do anything
  const urisForQuery = makeSelectSearchUris(queryWithOptions)(state);
  if (urisForQuery && !!urisForQuery.length) {
    return;
  }

  dispatch({
    type: ACTIONS.SEARCH_START,
  });

  // If the user is on the file page with a pre-populated uri and they select
  // the search option without typing anything, searchQuery will be empty
  // We need to populate it so the input is filled on the search page
  // isBackgroundSearch means the search is happening in the background, don't update the search query
  if (!state.search.searchQuery && !isBackgroundSearch) {
    dispatch(doUpdateSearchQuery(query));
  }

  const url = `${CONNECTION_STRING}search?${queryWithOptions}`;
  NativeModules.Requests.get(url)
    .then(handleNativeFetchResponse)
    .then((data: Array<{ name: String, claimId: string }>) => {
      const uris = [];
      const actions = [];

      data.forEach(result => {
        if (result.name) {
          const uri = buildURI({
            claimName: result.name,
            claimId: result.claimId,
          });
          actions.push(doResolveUri(uri));
          uris.push(uri);
        }
      });

      actions.push({
        type: ACTIONS.SEARCH_SUCCESS,
        data: {
          query: queryWithOptions,
          uris,
        },
      });
      dispatch(batchActions(...actions));
    })
    .catch(e => {
      dispatch({
        type: ACTIONS.SEARCH_FAIL,
      });
    });
};
