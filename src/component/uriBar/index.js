import { connect } from 'react-redux';
import {
  doUpdateSearchQuery,
  selectSearchState as selectSearch,
  selectSearchValue,
  selectSearchSuggestions,
  SETTINGS,
} from 'lbry-redux';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import { makeSelectClientSetting } from 'redux/selectors/settings';
import UriBar from './view';

const select = state => {
  const { ...searchState } = selectSearch(state);

  return {
    ...searchState,
    query: selectSearchValue(state),
    currentRoute: selectCurrentRoute(state),
    suggestions: selectSearchSuggestions(state),
    showUriBarSuggestions: makeSelectClientSetting(SETTINGS.SHOW_URI_BAR_SUGGESTIONS)(state),
  };
};

const perform = dispatch => ({
  updateSearchQuery: query => dispatch(doUpdateSearchQuery(query)),
});

export default connect(
  select,
  perform
)(UriBar);
