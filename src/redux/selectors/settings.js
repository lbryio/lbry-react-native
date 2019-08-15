import { SETTINGS } from 'lbry-redux';
import { createSelector } from 'reselect';
import { getSortByItemForName, getTimeItemForName } from 'utils/helper';

const selectState = state => state.settings || {};

export const selectDaemonSettings = createSelector(
  selectState,
  state => state.daemonSettings
);

export const selectClientSettings = createSelector(
  selectState,
  state => state.clientSettings || {}
);

export const selectSortByItem = createSelector(
  selectState,
  state => getSortByItemForName(state.sortByItemName)
);

export const selectTimeItem = createSelector(
  selectState,
  state => getTimeItemForName(state.timeItemName)
);

export const makeSelectClientSetting = setting =>
  createSelector(
    selectClientSettings,
    settings => (settings ? settings[setting] : undefined)
  );

// refactor me
export const selectShowNsfw = makeSelectClientSetting(SETTINGS.SHOW_NSFW);

export const selectKeepDaemonRunning = makeSelectClientSetting(SETTINGS.KEEP_DAEMON_RUNNING);
