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

export const selectHasPublishFormState = createSelector(
  selectPublishFormState,
  values => Object.keys(values).length > 0
);

export const selectHasChannelFormState = createSelector(
  selectChannelFormState,
  values => Object.keys(values).length > 0
);
