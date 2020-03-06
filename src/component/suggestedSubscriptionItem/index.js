import { connect } from 'react-redux';
import {
  doResolveUri,
  makeSelectClaimForUri,
  makeSelectThumbnailForUri,
  makeSelectTitleForUri,
  makeSelectIsUriResolving,
} from 'lbry-redux';
import { doChannelSubscribe, doChannelUnsubscribe, makeSelectIsSubscribed } from 'lbryinc';
import SuggestedSubscriptionItem from './view';

const select = (state, props) => ({
  thumbnail: makeSelectThumbnailForUri(props.uri)(state),
  title: makeSelectTitleForUri(props.uri)(state),
  claim: makeSelectClaimForUri(props.uri)(state),
  isResolvingUri: makeSelectIsUriResolving(props.uri)(state),
  isSubscribed: makeSelectIsSubscribed(props.uri, true)(state),
});

const perform = dispatch => ({
  resolveUri: uri => dispatch(doResolveUri(uri)),
  subscribe: subscription => doChannelSubscribe(subscription),
  unsubscribe: subscription => doChannelUnsubscribe(subscription),
});

export default connect(
  select,
  perform,
)(SuggestedSubscriptionItem);
