import { connect } from 'react-redux';
import {
  doResolveUris,
  makeSelectClaimForUri,
  makeSelectRecommendedContentForUri,
  makeSelectTitleForUri,
  selectIsSearching,
} from 'lbry-redux';
import RelatedContent from './view';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  recommendedContent: makeSelectRecommendedContentForUri(props.uri)(state),
  title: makeSelectTitleForUri(props.uri)(state),
  isSearching: selectIsSearching(state),
});

const perform = dispatch => ({
  resolveUris: uris => dispatch(doResolveUris(uris)),
});

export default connect(
  select,
  perform
)(RelatedContent);
