import { connect } from 'react-redux';
import {
  doResolveUri,
  makeSelectClaimForUri,
  makeSelectMetadataForUri,
  makeSelectFileInfoForUri,
  makeSelectThumbnailForUri,
  makeSelectTitleForUri,
  makeSelectIsUriResolving,
  makeSelectClaimIsNsfw,
  makeSelectShortUrlForUri,
} from 'lbry-redux';
import { doSetPlayerVisible } from 'redux/actions/drawer';
import { selectBlackListedOutpoints, selectFilteredOutpoints, selectRewardContentClaimIds } from 'lbryinc';
import { selectShowNsfw } from 'redux/selectors/settings';
import FileItem from './view';

const select = (state, props) => ({
  blackListedOutpoints: selectBlackListedOutpoints(state),
  claim: makeSelectClaimForUri(props.uri)(state),
  fileInfo: makeSelectFileInfoForUri(props.uri)(state),
  filteredOutpoints: selectFilteredOutpoints(state),
  metadata: makeSelectMetadataForUri(props.uri)(state),
  rewardedContentClaimIds: selectRewardContentClaimIds(state),
  isResolvingUri: makeSelectIsUriResolving(props.uri)(state),
  obscureNsfw: !selectShowNsfw(state),
  shortUrl: makeSelectShortUrlForUri(props.uri)(state),
  thumbnail: makeSelectThumbnailForUri(props.uri)(state),
  title: makeSelectTitleForUri(props.uri)(state),
  nsfw: makeSelectClaimIsNsfw(props.uri)(state),
});

const perform = dispatch => ({
  resolveUri: uri => dispatch(doResolveUri(uri, 'https://api.lbry.tv/api/v1/proxy')),
  setPlayerVisible: (visible, uri) => dispatch(doSetPlayerVisible(visible, uri)),
});

export default connect(select, perform)(FileItem);
