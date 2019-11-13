import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';

const isProduction = !__DEV__; // eslint-disable-line no-undef
let knownMessages = null;

window.i18n_messages = window.i18n_messages || {};

function saveMessage(message) {
  const messagesFilePath = RNFS.ExternalDirectoryPath + '/app-strings.json';
  console.log(messagesFilePath);

  if (knownMessages === null) {
    RNFS.readFile(messagesFilePath, 'utf8')
      .then(fileContents => {
        knownMessages = JSON.parse(fileContents);
        checkMessageAndSave(message, messagesFilePath);
      })
      .catch(err => {
        knownMessages = {}; // no known messages, initialise the object
        checkMessageAndSave(message, messagesFilePath);
      });
  } else {
    checkMessageAndSave(message, messagesFilePath);
  }
}

function checkMessageAndSave(message, messagesFilePath) {
  if (!knownMessages[message]) {
    knownMessages[message] = message;
    RNFS.writeFile(messagesFilePath, JSON.stringify(knownMessages, null, 2), 'utf8')
      .then(() => {
        // successful write
      })
      .catch(err => {
        if (err) {
          throw err;
        }
      });
  }
}

export function __(message, tokens) {
  let language =
    Platform.OS === 'android'
      ? NativeModules.I18nManager.localeIdentifier
      : NativeModules.SettingsManager.settings.AppleLocale;
  language = language ? language.substring(0, 2) : 'en';
  console.log('LANG=' + language);

  if (!isProduction) {
    saveMessage(message);
  }

  const translatedMessage = window.i18n_messages[language]
    ? window.i18n_messages[language][message] || message
    : message;

  if (!tokens) {
    return translatedMessage;
  }

  return translatedMessage.replace(/%([^%]+)%/g, function($1, $2) {
    return tokens[$2] || $2;
  });
}
