import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import { ACTIONS, batchActions, selectMyClaims } from 'lbry-redux';

export const doUpdatePublishFormState = publishFormValue => dispatch =>
  dispatch({
    type: Constants.ACTION_UPDATE_PUBLISH_FORM_STATE,
    data: { ...publishFormValue },
  });

export const doUpdateChannelFormState = channelFormValue => dispatch =>
  dispatch({
    type: Constants.ACTION_UPDATE_CHANNEL_FORM_STATE,
    data: { ...channelFormValue },
  });

export const doClearPublishFormState = () => dispatch =>
  dispatch({
    type: Constants.ACTION_CLEAR_PUBLISH_FORM_STATE,
  });

export const doClearChannelFormState = () => dispatch =>
  dispatch({
    type: Constants.ACTION_CLEAR_CHANNEL_FORM_STATE,
  });

export const doPendingPublishSuccess = pendingClaim => (dispatch, getState) => {
  const state = getState();
  const myClaims = selectMyClaims(state);
  const { permanent_url: url } = pendingClaim;
  const actions = [
    {
      type: ACTIONS.PUBLISH_SUCCESS,
    },
  ];

  // We have to fake a temp claim until the new pending one is returned by claim_list_mine
  // We can't rely on claim_list_mine because there might be some delay before the new claims are returned
  // Doing this allows us to show the pending claim immediately, it will get overwritten by the real one
  const isMatch = claim => claim.claim_id === pendingClaim.claim_id;
  const isEdit = myClaims.some(isMatch);

  const myNewClaims = isEdit
    ? myClaims.map(claim => (isMatch(claim) ? pendingClaim : claim))
    : myClaims.concat(pendingClaim);
  actions.push({
    type: ACTIONS.FETCH_CLAIM_LIST_MINE_COMPLETED,
    data: {
      claims: myNewClaims,
    },
  });
  dispatch(batchActions(...actions));
};
