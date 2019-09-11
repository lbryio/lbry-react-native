import { createSelector } from 'reselect';

export const selectState = state => state.form || {};

export const selectPublishFormState = createSelector(
  selectState,
  state => state.publishFormValues || {}
);

export const selectChannelFormState = createSelector(
  selectState,
  state => state.channelFormValues || {}
);
