import { connect } from 'react-redux';
import {
  doResolveUris,
  doSearch,
  makeSelectClaimForUri,
  makeSelectRecommendedContentForUri,
  selectResolvingUris,
  selectIsSearching,
} from 'lbry-redux';
import RelatedContent from './view';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  isSearching: selectIsSearching(state),
  recommendedContent: makeSelectRecommendedContentForUri(props.uri)(state),
  resolvingUris: selectResolvingUris(state),
});

const perform = dispatch => ({
  resolveUris: uris => dispatch(doResolveUris(uris)),
  searchRecommended: query => dispatch(doSearch(query, 20, undefined, true)),
});

export default connect(
  select,
  perform,
)(RelatedContent);
