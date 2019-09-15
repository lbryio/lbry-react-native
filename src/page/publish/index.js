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
import { selectDrawerStack } from 'redux/selectors/drawer';
import { doUpdatePublishFormState, doClearPublishFormState } from 'redux/actions/form';
import { doPushDrawerStack, doPopDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { selectPublishFormState, selectHasPublishFormState } from 'redux/selectors/form';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PublishPage from './view';

const select = state => ({
  balance: selectBalance(state),
  drawerStack: selectDrawerStack(state),
  hasFormState: selectHasPublishFormState(state),
  publishFormState: selectPublishFormState(state),
  publishFormValues: selectPublishFormValues(state),
});

const perform = dispatch => ({
  notify: data => dispatch(doToast(data)),
  clearPublishFormState: () => dispatch(doClearPublishFormState()),
  updatePublishForm: value => dispatch(doUpdatePublishForm(value)),
  updatePublishFormState: data => dispatch(doUpdatePublishFormState(data)),
  uploadThumbnail: (filePath, fsAdapter) => dispatch(doUploadThumbnail(filePath, null, fsAdapter)),
  publish: (success, fail) => dispatch(doPublish(success, fail)),
  resolveUri: uri => dispatch(doResolveUri(uri)),
  pushDrawerStack: (routeName, params) => dispatch(doPushDrawerStack(routeName, params)),
  popDrawerStack: () => dispatch(doPopDrawerStack()),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform
)(PublishPage);
