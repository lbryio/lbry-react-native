import { connect } from 'react-redux';
import {
  doResolveUris,
  doResolvedSearch,
  makeSelectClaimForUri,
  makeSelectResolvedRecommendedContentForUri,
  selectResolvingUris,
  selectIsSearching,
} from 'lbry-redux';
import { selectShowNsfw } from 'redux/selectors/settings';
import RelatedContent from './view';

const RESULT_SIZE = 16;

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  isSearching: selectIsSearching(state),
  recommendedContent: makeSelectResolvedRecommendedContentForUri(props.uri, RESULT_SIZE)(state),
  resolvingUris: selectResolvingUris(state),
  showNsfwContent: selectShowNsfw(state),
});

const perform = dispatch => ({
  resolveUris: uris => dispatch(doResolveUris(uris)),
  searchRecommended: (query, claimId, nsfw) =>
    dispatch(doResolvedSearch(query, RESULT_SIZE, undefined, true, { related_to: claimId }, nsfw)),
});

export default connect(
  select,
  perform,
)(RelatedContent);
