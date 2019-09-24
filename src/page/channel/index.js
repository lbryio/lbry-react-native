import { connect } from 'react-redux';
import { doAbandonClaim, doFetchChannelListMine, makeSelectClaimForUri, selectMyChannelClaims } from 'lbry-redux';
import { doPopDrawerStack } from 'redux/actions/drawer';
import { doSetSortByItem, doSetTimeItem } from 'redux/actions/settings';
import { selectDrawerStack } from 'redux/selectors/drawer';
import { selectSortByItem, selectTimeItem } from 'redux/selectors/settings';
import ChannelPage from './view';

const select = (state, props) => ({
  channels: selectMyChannelClaims(state),
  claim: makeSelectClaimForUri(props.uri)(state),
  drawerStack: selectDrawerStack(state),
  sortByItem: selectSortByItem(state),
  timeItem: selectTimeItem(state),
});

const perform = dispatch => ({
  abandonClaim: (txid, nout) => dispatch(doAbandonClaim(txid, nout)),
  fetchChannelListMine: () => dispatch(doFetchChannelListMine()),
  popDrawerStack: () => dispatch(doPopDrawerStack()),
  setSortByItem: item => dispatch(doSetSortByItem(item)),
  setTimeItem: item => dispatch(doSetTimeItem(item)),
});

export default connect(
  select,
  perform
)(ChannelPage);
