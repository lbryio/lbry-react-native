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
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import DownloadsPage from './view';

const select = state => ({
  claims: selectMyClaimsWithoutChannels(state),
  currentRoute: selectCurrentRoute(state),
  fileInfos: selectFileInfosDownloaded(state),
  downloadedUris: selectDownloadedUris(state),
  fetching: selectIsFetchingFileList(state) || selectIsFetchingClaimListMine(state),
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

export default connect(
  select,
  perform
)(DownloadsPage);
