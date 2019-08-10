import { connect } from 'react-redux';
import {
  doPublish,
  doResolveUri,
  doToast,
  doUpdatePublishForm,
  doUploadThumbnail,
  selectBalance,
  selectPublishFormValues,
} from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PublishPage from './view';

const select = state => ({
  balance: selectBalance(state),
  publishFormValues: selectPublishFormValues(state),
});

const perform = dispatch => ({
  notify: data => dispatch(doToast(data)),
  updatePublishForm: value => dispatch(doUpdatePublishForm(value)),
  uploadThumbnail: (filePath, fsAdapter) => dispatch(doUploadThumbnail(filePath, null, fsAdapter)),
  publish: params => dispatch(doPublish(params)),
  resolveUri: uri => dispatch(doResolveUri(uri)),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_PUBLISH)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform
)(PublishPage);
