import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api

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
