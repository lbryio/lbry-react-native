import { connect } from 'react-redux';
import {
  doClearRepostError,
  doFetchChannelListMine,
  doRepost,
  doToast,
  selectBalance,
  selectMyChannelClaims,
  selectRepostError,
  selectRepostLoading,
} from 'lbry-redux';
import ModalRepostView from './view';

const select = state => ({
  balance: selectBalance(state),
  channels: selectMyChannelClaims(state),
  reposting: selectRepostLoading(state),
  error: selectRepostError(state),
});

const perform = dispatch => ({
  fetchChannelListMine: () => dispatch(doFetchChannelListMine(1, 99999, true)),
  notify: data => dispatch(doToast(data)),
  repost: options => dispatch(doRepost(options)),
  clearError: () => dispatch(doClearRepostError()),
});

export default connect(select, perform)(ModalRepostView);
