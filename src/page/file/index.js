import { connect } from 'react-redux';
import {
  doAbandonClaim,
  doFetchFileInfo,
  doFetchChannelListMine,
  doFetchClaimListMine,
  doFileGet,
  doPurchaseUri,
  doDeletePurchasedUri,
  doResolveUri,
  doSendTip,
  doToast,
  makeSelectIsUriResolving,
  makeSelectFileInfoForUri,
  makeSelectChannelForClaimUri,
  makeSelectClaimForUri,
  makeSelectContentPositionForUri,
  makeSelectContentTypeForUri,
  makeSelectMetadataForUri,
  makeSelectStreamingUrlForUri,
  makeSelectThumbnailForUri,
  makeSelectTitleForUri,
  selectBalance,
  selectMyChannelClaims,
  selectMyClaimUrisWithoutChannels,
  selectPurchasedUris,
  selectFailedPurchaseUris,
  selectPurchaseUriErrorMessage,
} from 'lbry-redux';
import {
  doClaimEligiblePurchaseRewards,
  doFetchCostInfoForUri,
  makeSelectCostInfoForUri,
  selectRewardContentClaimIds,
  selectBlackListedOutpoints,
} from 'lbryinc';
import {
  doStartDownload,
  doUpdateDownload,
  doCompleteDownload,
  doDeleteFile,
  doStopDownloadingFile,
} from 'redux/actions/file';
import { doPopDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { doToggleFullscreenMode } from 'redux/actions/settings';
import { selectDrawerStack } from 'redux/selectors/drawer';
import FilePage from './view';

const select = (state, props) => {
  const { uri, fullUri } = props.navigation.state.params;
  const contentUri = fullUri || uri;
  const selectProps = { uri: contentUri };
  return {
    balance: selectBalance(state),
    blackListedOutpoints: selectBlackListedOutpoints(state),
    channels: selectMyChannelClaims(state),
    claim: makeSelectClaimForUri(contentUri)(state),
    drawerStack: selectDrawerStack(state),
    isResolvingUri: makeSelectIsUriResolving(contentUri)(state),
    contentType: makeSelectContentTypeForUri(contentUri)(state),
    costInfo: makeSelectCostInfoForUri(contentUri)(state),
    metadata: makeSelectMetadataForUri(contentUri)(state),
    fileInfo: makeSelectFileInfoForUri(contentUri)(state),
    rewardedContentClaimIds: selectRewardContentClaimIds(state, selectProps),
    channelUri: makeSelectChannelForClaimUri(contentUri, true)(state),
    position: makeSelectContentPositionForUri(contentUri)(state),
    purchasedUris: selectPurchasedUris(state),
    failedPurchaseUris: selectFailedPurchaseUris(state),
    myClaimUris: selectMyClaimUrisWithoutChannels(state),
    purchaseUriErrorMessage: selectPurchaseUriErrorMessage(state),
    streamingUrl: makeSelectStreamingUrlForUri(contentUri)(state),
    thumbnail: makeSelectThumbnailForUri(contentUri)(state),
    title: makeSelectTitleForUri(contentUri)(state),
  };
};

const perform = dispatch => ({
  abandonClaim: (txid, nout) => dispatch(doAbandonClaim(txid, nout)),
  claimEligibleRewards: () => dispatch(doClaimEligiblePurchaseRewards()),
  deleteFile: (fileInfo, deleteFromDevice, abandonClaim) => {
    dispatch(doDeleteFile(fileInfo, deleteFromDevice, abandonClaim));
  },
  fetchFileInfo: uri => dispatch(doFetchFileInfo(uri)),
  fetchCostInfo: uri => dispatch(doFetchCostInfoForUri(uri)),
  fetchMyClaims: () => dispatch(doFetchClaimListMine()),
  fetchChannelListMine: () => dispatch(doFetchChannelListMine()),
  fileGet: (uri, saveFile) => dispatch(doFileGet(uri, saveFile)),
  notify: data => dispatch(doToast(data)),
  popDrawerStack: () => dispatch(doPopDrawerStack()),
  purchaseUri: (uri, costInfo, saveFile) => dispatch(doPurchaseUri(uri, costInfo, saveFile)),
  deletePurchasedUri: uri => dispatch(doDeletePurchasedUri(uri)),
  resolveUri: uri => dispatch(doResolveUri(uri)),
  sendTip: (amount, claimId, isSupport, successCallback, errorCallback) =>
    dispatch(doSendTip(amount, claimId, isSupport, successCallback, errorCallback)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(true)),
  stopDownload: (uri, fileInfo) => dispatch(doStopDownloadingFile(uri, fileInfo)),
  startDownload: (uri, outpoint, fileInfo) => dispatch(doStartDownload(uri, outpoint, fileInfo)),
  updateDownload: (uri, outpoint, fileInfo, progress) => dispatch(doUpdateDownload(uri, outpoint, fileInfo, progress)),
  completeDownload: (uri, outpoint, fileInfo) => dispatch(doCompleteDownload(uri, outpoint, fileInfo)),
  toggleFullscreenMode: mode => dispatch(doToggleFullscreenMode(mode)),
});

export default connect(
  select,
  perform
)(FilePage);
