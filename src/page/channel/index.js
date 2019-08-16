import { connect } from 'react-redux';
import { doFetchClaimsByChannel, makeSelectClaimForUri } from 'lbry-redux';
import { doPopDrawerStack } from 'redux/actions/drawer';
import { doSetSortByItem, doSetTimeItem } from 'redux/actions/settings';
import { selectDrawerStack } from 'redux/selectors/drawer';
import { selectSortByItem, selectTimeItem } from 'redux/selectors/settings';
import ChannelPage from './view';

const select = (state, props) => ({
  claim: makeSelectClaimForUri(props.uri)(state),
  drawerStack: selectDrawerStack(state),
  sortByItem: selectSortByItem(state),
  timeItem: selectTimeItem(state),
});

const perform = dispatch => ({
  fetchClaims: (uri, page) => dispatch(doFetchClaimsByChannel(uri, page)),
  popDrawerStack: () => dispatch(doPopDrawerStack()),
  setSortByItem: item => dispatch(doSetSortByItem(item)),
  setTimeItem: item => dispatch(doSetTimeItem(item)),
});

export default connect(
  select,
  perform
)(ChannelPage);
