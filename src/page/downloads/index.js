import { connect } from 'react-redux';
import {
  doFileList,
  doFetchClaimListMine,
  selectFileInfosDownloaded,
  selectDownloadedUris,
  selectMyClaimsWithoutChannels,
  selectIsFetchingClaimListMine,
  selectIsFetchingFileList,
} from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { doDeleteFile } from 'redux/actions/file';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import { selectSdkReady } from 'redux/selectors/settings';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import DownloadsPage from './view';

const select = state => ({
  claims: selectMyClaimsWithoutChannels(state),
  currentRoute: selectCurrentRoute(state),
  downloadedUris: selectDownloadedUris(state),
  fileInfos: selectFileInfosDownloaded(state),
  fetching: selectIsFetchingFileList(state) || selectIsFetchingClaimListMine(state),
  sdkReady: selectSdkReady(state),
});

const perform = dispatch => ({
  deleteFile: (fileInfo, deleteFromDevice, abandonClaim) => {
    dispatch(doDeleteFile(fileInfo, deleteFromDevice, abandonClaim));
  },
  fetchMyClaims: () => dispatch(doFetchClaimListMine()),
  fileList: () => dispatch(doFileList()),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_MY_LBRY)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(select, perform)(DownloadsPage);
