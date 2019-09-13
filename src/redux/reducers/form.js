import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api

const reducers = {};
const defaultState = {
  channelFormValues: {},
  publishFormValues: {},
};

reducers[Constants.ACTION_UPDATE_PUBLISH_FORM_STATE] = (state, action) => {
  const { data } = action;
  const publishFormValues = Object.assign({}, state.publishFormValues);
  const newPublishFormValues = Object.assign(publishFormValues, data);

  return {
    ...state,
    publishFormValues: newPublishFormValues,
  };
};

reducers[Constants.ACTION_UPDATE_CHANNEL_FORM_STATE] = (state, action) => {
  const { data } = action;
  const channelFormValues = Object.assign({}, state.channelFormValues);
  const newChannelFormValues = Object.assign(channelFormValues, data);

  return {
    ...state,
    channelFormValues: newChannelFormValues,
  };
};

reducers[Constants.ACTION_CLEAR_PUBLISH_FORM_STATE] = state => {
  return {
    ...state,
    publishFormValues: {},
  };
};

reducers[Constants.ACTION_CLEAR_CHANNEL_FORM_STATE] = state => {
  return {
    ...state,
    channelFormValues: {},
  };
};

export default function reducer(state = defaultState, action) {
  const handler = reducers[action.type];
  if (handler) return handler(state, action);
  return state;
}
