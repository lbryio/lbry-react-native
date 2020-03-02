# LBRY React Native
[![pipeline status](https://ci.lbry.tech/lbry/lbry-android/badges/master/pipeline.svg)](https://ci.lbry.tech/lbry/lbry-android/commits/master)

A mobile browser and wallet for the [LBRY](https://lbry.com) network. This app bundles [LBRY SDK](https://github.com/lbryio/lbry) as a background service with a UI layer built with React Native.

<img src="https://spee.ch/8/lbry-android.png" alt="LBRY Android Screenshot" width="384px" />

## Installation
The minimum supported Android version is 5.0 Lollipop. There are two ways to install:

1. Via the Google Play Store. Anyone can join the [open beta](https://play.google.com/apps/testing/io.lbry.browser) in order to install the app from the Play Store.
1. Direct APK install available at [http://build.lbry.io/android/latest.apk](http://build.lbry.io/android/latest.apk). You will need to enable installation from third-party sources on your device in order to install from this source.

## Usage
The app can be launched by opening **LBRY** from the device's app drawer or via the shortcut on the home screen if that was created upon installation.

## Running from Source
### Software Requirements
* Android Studio
* WebStorm (or other IDE for editing React Native / JavaScript code)
* npm
* yarn

### Android Steps
* Clone the repository using `git clone https://github.com/lbryio/lbry-react-native`
* Initialise the submodules.
```
cd lbry-react-native
git submodule update --init --recursive
```
* Install `react-native-cli` globally using `npm install -g react-native-cli`.
* Install the required package modules by running `yarn` in the cloned repository folder.
* Download a `google-services.json` from the Firebase console (https://console.firebase.google.com/) and place it in the `android/app` folder. Alternatively, use the included sample JSON file.
```
cp android/app/google-services.sample.json android/app/google-services.json
```
* Open Android Studio and click File > Open...
* Navigate to the cloned repository on your local filesystem and select the `android` subfolder.
* Connect your Android device in USB debugging mode, or create an ARM emulator (slower) to run the app.
* Click Run > Run... and select the corresponding app configuration. Note that it may take a while for the project files to sync before you can run the app
* In order to edit the React Native / JavaScript files, open the cloned repository folder using WebStorm (or your favourite IDE).

### React Native Fast Refresh
In order to enable fast refresh when updating React Native code
* Connect your Android device in USB debugging mode, or create an ARM emulator
* Run `adb reverse tcp:8081 tcp:8081` (`adb` can be found in the `platform-tools` folder of your Android SDK installation)
* Run `yarn start`
* Press `r` to reload the app.
* Anytime you make an update to the React Native code, the app should automatically refresh.

## Contributing
Contributions to this project are welcome, encouraged, and compensated. For more details, see https://lbry.io/faq/contributing

## License
This project is MIT licensed. For the full license, see [LICENSE](LICENSE).

## Security
We take security seriously. Please contact security@lbry.com regarding any security issues. Our PGP key is [here](https://keybase.io/lbry/key.asc) if you need it.

## Contact
The primary contact for this project is [@akinwale](https://github.com/akinwale) (akinwale@lbry.com)
