import { connect } from 'react-redux';
import {
  makeSelectClaimForUri,
  makeSelectRecommendedContentForUri,
  makeSelectTitleForUri,
  selectIsSearching,
} from 'lbry-redux';
import { doNativeSearch } from 'redux/actions/performance';
import RelatedContent from './view';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  recommendedContent: makeSelectRecommendedContentForUri(props.uri)(state),
  title: makeSelectTitleForUri(props.uri)(state),
  isSearching: selectIsSearching(state),
});

const perform = dispatch => ({
  search: query => dispatch(doNativeSearch(query, 20, undefined, true)),
});

export default connect(
  select,
  perform
)(RelatedContent);
