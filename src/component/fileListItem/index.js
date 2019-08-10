import { connect } from 'react-redux';
import {
  doResolveUri,
  makeSelectClaimForUri,
  makeSelectMetadataForUri,
  makeSelectFileInfoForUri,
  makeSelectIsUriResolving,
  makeSelectClaimIsNsfw,
  makeSelectTitleForUri,
  makeSelectThumbnailForUri,
} from 'lbry-redux';
import { selectBlackListedOutpoints, selectFilteredOutpoints } from 'lbryinc';
import { selectShowNsfw } from 'redux/selectors/settings';
import FileListItem from './view';

const select = (state, props) => ({
  blackListedOutpoints: selectBlackListedOutpoints(state),
  claim: makeSelectClaimForUri(props.uri)(state),
  fileInfo: makeSelectFileInfoForUri(props.uri)(state),
  filteredOutpoints: selectFilteredOutpoints(state),
  isDownloaded: !!makeSelectFileInfoForUri(props.uri)(state),
  metadata: makeSelectMetadataForUri(props.uri)(state),
  nsfw: makeSelectClaimIsNsfw(props.uri)(state),
  isResolvingUri: makeSelectIsUriResolving(props.uri)(state),
  obscureNsfw: !selectShowNsfw(state),
  title: makeSelectTitleForUri(props.uri)(state),
  thumbnail: makeSelectThumbnailForUri(props.uri)(state),
});

const perform = dispatch => ({
  resolveUri: uri => dispatch(doResolveUri(uri)),
});

export default connect(
  select,
  perform
)(FileListItem);
