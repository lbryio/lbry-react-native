const SORT_BY_NEW = 'new';
const SORT_BY_HOT = 'hot';
const SORT_BY_TOP = 'top';

const TIME_DAY = 'day';
const TIME_WEEK = 'week';
const TIME_MONTH = 'month';
const TIME_YEAR = 'year';
const TIME_ALL = 'all';

const Constants = {
  FIRST_RUN_PAGE_WELCOME: 'welcome',
  FIRST_RUN_PAGE_EMAIL_COLLECT: 'email-collect',
  FIRST_RUN_PAGE_EMAIL_VERIFY: 'email-verify',
  FIRST_RUN_PAGE_WALLET: 'wallet',
  FIRST_RUN_PAGE_SKIP_ACCOUNT: 'skip-account',

  VERIFY_PAGE_EMAIL: 'email-verify',
  VERIFY_PAGE_PHONE_NUMBER: 'phone-number-verify',

  PHASE_COLLECTION: 'collection',
  PHASE_VERIFICATION: 'verification',

  PHASE_SELECTOR: 'selector',
  PHASE_DETAILS: 'details',
  PHASE_PUBLISH: 'publish',

  PHASE_LIST: 'list',
  PHASE_NEW: 'create',

  CONTENT_TAB: 'content',
  ABOUT_TAB: 'about',

  KEY_FIRST_RUN_EMAIL: 'firstRunEmail',
  KEY_WALLET_PASSWORD: 'firstRunPassword',
  KEY_FIRST_USER_AUTH: 'firstUserAuth',
  KEY_SHOULD_VERIFY_EMAIL: 'shouldVerifyEmail',
  KEY_EMAIL_VERIFY_PENDING: 'emailVerifyPending',

  SETTING_ALPHA_UNDERSTANDS_RISKS: 'alphaUnderstandRisks',
  SETTING_SUBSCRIPTIONS_VIEW_MODE: 'subscriptionsViewMode',
  SETTING_RATING_REMINDER_LAST_SHOWN: 'ratingReminderLastShown',
  SETTING_RATING_REMINDER_DISABLED: 'ratingReminderDisabled',
  SETTING_BACKUP_DISMISSED: 'backupDismissed',
  SETTING_REWARDS_NOT_INTERESTED: 'rewardsNotInterested',
  SETTING_DEVICE_WALLET_SYNCED: 'deviceWalletSynced',
  SETTING_DHT_ENABLED: 'dhtEnabled',
  SETTING_NEW_ANDROID_REWARD_CLAIMED: 'newAndroidRewardClaimed',

  ACTION_SDK_READY: 'SDK_READY',

  ACTION_DELETE_COMPLETED_BLOBS: 'DELETE_COMPLETED_BLOBS',
  ACTION_FIRST_RUN_PAGE_CHANGED: 'FIRST_RUN_PAGE_CHANGED',

  ACTION_PUSH_DRAWER_STACK: 'PUSH_DRAWER_STACK',
  ACTION_POP_DRAWER_STACK: 'POP_DRAWER_STACK',
  ACTION_SET_PLAYER_VISIBLE: 'SET_PLAYER_VISIBLE',

  ACTION_REACT_NAVIGATION_RESET: 'Navigation/RESET',
  ACTION_REACT_NAVIGATION_NAVIGATE: 'Navigation/NAVIGATE',
  ACTION_REACT_NAVIGATION_REPLACE: 'Navigation/REPLACE',

  ACTION_SORT_BY_ITEM_CHANGED: 'SORT_BY_ITEM_CHANGED',
  ACTION_TIME_ITEM_CHANGED: 'TIME_ITEM_CHANGED',

  ACTION_UPDATE_PUBLISH_FORM_STATE: 'UPDATE_PUBLISH_FORM_STATE',
  ACTION_UPDATE_CHANNEL_FORM_STATE: 'UPDATE_CHANNEL_FORM_STATE',
  ACTION_CLEAR_PUBLISH_FORM_STATE: 'CLEAR_PUBLISH_FORM_STATE',
  ACTION_CLEAR_CHANNEL_FORM_STATE: 'CLEAR_CHANNEL_FORM_STATE',

  ACTION_SET_EXPLICIT_NAVIGATE_BACK: 'SET_EXPLICIT_NAVIGATE_BACK',

  ACTION_FULLSCREEN_MODE_TOGGLED: 'FULLSCREEN_MODE_TOGGLED',

  ORIENTATION_HORIZONTAL: 'horizontal',
  ORIENTATION_VERTICAL: 'vertical',

  PAGE_REWARDS: 'rewards',
  PAGE_SETTINGS: 'settings',
  PAGE_TRENDING: 'trending',
  PAGE_WALLET: 'wallet',

  DRAWER_ROUTE_DISCOVER: 'Discover',
  DRAWER_ROUTE_EDITORS_CHOICE: 'EditorsChoice',
  DRAWER_ROUTE_TRENDING: 'Trending',
  DRAWER_ROUTE_SUBSCRIPTIONS: 'Subscriptions',
  DRAWER_ROUTE_MY_LBRY: 'Downloads',
  DRAWER_ROUTE_PUBLISH: 'Publish',
  DRAWER_ROUTE_PUBLISH_FORM: 'PublishForm',
  DRAWER_ROUTE_PUBLISHES: 'Publishes',
  DRAWER_ROUTE_REWARDS: 'Rewards',
  DRAWER_ROUTE_WALLET: 'Wallet',
  DRAWER_ROUTE_SETTINGS: 'Settings',
  DRAWER_ROUTE_ABOUT: 'About',
  DRAWER_ROUTE_SEARCH: 'Search',
  DRAWER_ROUTE_TRANSACTION_HISTORY: 'TransactionHistory',
  DRAWER_ROUTE_TAG: 'Tag',
  DRAWER_ROUTE_CHANNEL_CREATOR: 'ChannelCreator',
  DRAWER_ROUTE_CHANNEL_CREATOR_FORM: 'ChannnelCreatorForm',
  DRAWER_ROUTE_INVITES: 'Invites',
  DRAWER_ROUTE_LITE_FILE: 'LiteFile',

  FULL_ROUTE_NAME_DISCOVER: 'DiscoverStack',
  FULL_ROUTE_NAME_WALLET: 'WalletStack',

  ROUTE_FILE: 'File',
  DRAWER_ROUTE_FILE_VIEW: 'FileView',

  ITEM_CREATE_A_CHANNEL: 'Create a channel...',
  ITEM_ANONYMOUS: 'Publish anonymously',

  SUBSCRIPTIONS_VIEW_ALL: 'view_all',
  SUBSCRIPTIONS_VIEW_LATEST_FIRST: 'view_latest_first',

  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=io.lbry.browser',
  RATING_REMINDER_INTERVAL: 604800, // 7 days (7 * 24 * 3600s)

  SORT_BY_HOT,
  SORT_BY_NEW,
  SORT_BY_TOP,

  TIME_DAY,
  TIME_WEEK,
  TIME_MONTH,
  TIME_YEAR,
  TIME_ALL,

  CLAIM_SEARCH_SORT_BY_ITEMS: [
    { icon: 'fire-alt', name: SORT_BY_HOT, label: 'Trending content' },
    { icon: 'certificate', name: SORT_BY_NEW, label: 'New content' },
    { icon: 'chart-line', name: SORT_BY_TOP, label: 'Top content' },
  ],

  CLAIM_SEARCH_TIME_ITEMS: [
    { name: TIME_DAY, label: 'Past 24 hours' },
    { name: TIME_WEEK, label: 'Past week' },
    { name: TIME_MONTH, label: 'Past month' },
    { name: TIME_YEAR, label: 'Past year' },
    { name: TIME_ALL, label: 'All time' },
  ],

  DEFAULT_ORDER_BY: ['trending_group', 'trending_mixed'],

  ORDER_BY_EFFECTIVE_AMOUNT: 'effective_amount',

  DEFAULT_PAGE_SIZE: 20,

  ALL_PLACEHOLDER: '_all',

  MORE_PLACEHOLDER: '_more',

  TRUE_STRING: 'true',

  MINIMUM_TRANSACTION_BALANCE: 0.01,

  SHARE_BASE_URL: 'https://open.lbry.com',
};

export default Constants;

export const DrawerRoutes = [
  Constants.DRAWER_ROUTE_DISCOVER,
  Constants.DRAWER_ROUTE_EDITORS_CHOICE,
  Constants.DRAWER_ROUTE_TRENDING,
  Constants.DRAWER_ROUTE_SUBSCRIPTIONS,
  Constants.DRAWER_ROUTE_MY_LBRY,
  Constants.DRAWER_ROUTE_TAG,
  Constants.DRAWER_ROUTE_PUBLISH,
  Constants.DRAWER_ROUTE_REWARDS,
  Constants.DRAWER_ROUTE_WALLET,
  Constants.DRAWER_ROUTE_PUBLISH,
  Constants.DRAWER_ROUTE_PUBLISHES,
  Constants.DRAWER_ROUTE_SETTINGS,
  Constants.DRAWER_ROUTE_ABOUT,
  Constants.DRAWER_ROUTE_SEARCH,
  Constants.DRAWER_ROUTE_TRANSACTION_HISTORY,
  Constants.DRAWER_ROUTE_CHANNEL_CREATOR,
  Constants.DRAWER_ROUTE_INVITES,
];

// sub-pages for main routes
export const InnerDrawerRoutes = [
  Constants.DRAWER_ROUTE_CHANNEL_CREATOR_FORM,
  Constants.DRAWER_ROUTE_PUBLISH_FORM,
  Constants.DRAWER_ROUTE_FILE_VIEW,
];
