import { connect } from 'react-redux';
import {
  makeSelectContentPositionForUri,
  selectBalance,
  from 'lbry-redux';
import {
  doClaimEligiblePurchaseRewards,
  makeSelectViewCountForUri,
} from 'lbryinc';
import { doToggleFullscreenMode } from 'redux/actions/settings';
import FilePage from './view';

const select = (state, props) => {
  const { uri, fullUri } = props.navigation.state.params;
  const contentUri = fullUri || uri;
  const selectProps = { uri: contentUri };
  return {
    balance: selectBalance(state),
    isPlayerVisible: makeSelectPlayerVisible(uri)(state), // use navigation uri for this selector
    position: makeSelectContentPositionForUri(contentUri)(state),
    viewCount: makeSelectViewCountForUri(contentUri)(state),
  };
};

const perform = dispatch => ({
  claimEligibleRewards: () => dispatch(doClaimEligiblePurchaseRewards()),
  setPlayerVisible: (visible, uri) => dispatch(doSetPlayerVisible(visible, uri)),
  toggleFullscreenMode: mode => dispatch(doToggleFullscreenMode(mode)),
});

export default connect(
  select,
  perform,
)(LiteFilePage);
