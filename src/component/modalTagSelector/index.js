import { connect } from 'react-redux';
import {
  selectUnfollowedTags,
  selectFollowedTags,
  doReplaceTags,
  doToggleTagFollow,
  doAddTag,
  doDeleteTag,
  doToast,
} from 'lbry-redux';
import ModalTagSelector from './view';

const select = state => ({
  unfollowedTags: selectUnfollowedTags(state),
  followedTags: selectFollowedTags(state),
});

export default connect(
  select,
  {
    doToggleTagFollow,
    doAddTag,
    doDeleteTag,
    doReplaceTags,
    doToast,
  }
)(ModalTagSelector);
