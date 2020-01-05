import { connect } from 'react-redux';
import {
  doResolveUris,
  doResolvedSearch,
  makeSelectClaimForUri,
  makeSelectResolvedRecommendedContentForUri,
  selectResolvingUris,
  selectIsSearching,
} from 'lbry-redux';
import RelatedContent from './view';

const RESULT_SIZE = 16;

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  isSearching: selectIsSearching(state),
  recommendedContent: makeSelectResolvedRecommendedContentForUri(props.uri, RESULT_SIZE)(state),
  resolvingUris: selectResolvingUris(state),
});

const perform = dispatch => ({
  resolveUris: uris => dispatch(doResolveUris(uris)),
  searchRecommended: (query, claimId) =>
    dispatch(doResolvedSearch(query, RESULT_SIZE, undefined, true, { related_to: claimId }, false)),
});

export default connect(
  select,
  perform,
)(RelatedContent);
