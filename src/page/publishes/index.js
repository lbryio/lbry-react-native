import { connect } from 'react-redux';
import {
  doAbandonClaim,
  doCheckPendingPublishes,
  doFetchClaimListMine,
  doToast,
  selectMyClaimUrisWithoutChannels,
  selectPendingClaims,
  selectIsFetchingClaimListMine,
} from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PublishesPage from './view';

const select = state => ({
  uris: selectMyClaimUrisWithoutChannels(state),
  fetching: selectIsFetchingClaimListMine(state),
  pendingClaims: selectPendingClaims(state),
});

const perform = dispatch => ({
  abandonClaim: (txid, nout) => dispatch(doAbandonClaim(txid, nout)),
  fetchMyClaims: () => dispatch(doFetchClaimListMine()),
  checkPendingPublishes: () => dispatch(doCheckPendingPublishes()),
  notify: data => dispatch(doToast(data)),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_PUBLISHES)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform
)(PublishesPage);
