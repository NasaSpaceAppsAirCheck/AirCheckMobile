![Symptom Log](/GASP/www/img/Symptom Log.png)

# Symptom Log (AirCheckMobile)

Application for logging allergy symptoms, location (lat,long) and EPA Air Quality Index (AQI).

## Requirements

- node
    + npm
    + [PhoneGap](http://phonegap.com/) `$ npm i -g phonegap`
- [OSX] XCode
- Android SDK

## Running in development

```bash
$ cd ./GASP/www/

# browser
$ phonegap serve

# iOS
$ phonegap run ios

# Android
$ phonegap run android
```

## Build for release

```bash
$ cd ./GASP/www/

$ phonegap build --release <platform>

# iOS
$ phonegap build --release ios

# Android
$ phonegap build --release android
```
