import { connect } from 'react-redux';
import { doFetchChannelListMine, selectMyChannelClaims } from 'lbry-redux';
import { selectUser } from 'lbryinc';
import DrawerContent from './view';

const select = state => ({
  channels: selectMyChannelClaims(state),
  user: selectUser(state),
});

const perform = dispatch => ({
  fetchChannelListMine: () => dispatch(doFetchChannelListMine(1, 99999, true)),
});

export default connect(
  select,
  perform,
)(DrawerContent);
