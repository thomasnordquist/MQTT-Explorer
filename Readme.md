# [MQTT Explorer](https://mqtt-explorer.com)

[![Downloads](https://img.shields.io/github/release/thomasnordquist/mqtt-explorer.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Downloads](https://img.shields.io/github/downloads/thomasnordquist/mqtt-explorer/total.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Build_Status](https://travis-ci.org/thomasnordquist/MQTT-Explorer.svg?branch=master)](https://travis-ci.org/thomasnordquist/MQTT-Explorer)
[![Build status](https://ci.appveyor.com/api/projects/status/c35tkm29rm4m5364/branch/master?svg=true)](https://ci.appveyor.com/project/thomasnordquist/mqtt-explorer/branch/master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/47b26e03fce543ceac7914214482334a)](https://app.codacy.com/app/thomasnordquist/MQTT-Explorer?utm_source=github.com&utm_medium=referral&utm_content=thomasnordquist/MQTT-Explorer&utm_campaign=Badge_Grade_Dashboard)

|   |   |   |
|:---:|:---:|:---:|
|[![screen1_small](https://user-images.githubusercontent.com/7721625/53954800-84b34c00-40d7-11e9-842d-bf655c569600.jpg)](https://user-images.githubusercontent.com/7721625/53954364-52551f00-40d6-11e9-93cf-d5a9601897ea.png)|[![screen2_small](https://user-images.githubusercontent.com/7721625/53954801-84b34c00-40d7-11e9-913a-42572e675620.jpg)](https://user-images.githubusercontent.com/7721625/53954365-52551f00-40d6-11e9-823f-afd66f19ed01.png)|[![screen3_small](https://user-images.githubusercontent.com/7721625/53954802-854be280-40d7-11e9-973c-08f23c8dbf89.jpg)](https://user-images.githubusercontent.com/7721625/53954366-52551f00-40d6-11e9-9738-74db830d03ac.png)|

# The App has moved to [mqtt-explorer.com](https://mqtt-explorer.com)
MQTT Explorer is a comprehensive and easy-to-use MQTT Client.  
Downloads can be found at the link above.

This page is dedicated to its development.
Pull-Requests and error reports are welcome.

## Run from sources

```bash
yarn
yarn build
yarn start
```

## Develop

Launch Application
```bash
yarn
yarn dev
```

The `app` directory contains all the rendering logic, the `backend` directory currently contains the models, tests, connection management, `src` contains all the electron bindings. [mqttjs](https://github.com/mqttjs/MQTT.js) is used to facilitate communication to MQTT brokers.

## Automated Tests

To achieve a reliable product automated tests run regularly on travis.

  - Data model
  - MQTT integration
  - UI-Tests (The demo is a recorded ui test)

## Run UI-tests
A [mosquitto](https://mosquitto.org/) MQTT broker is required to run the ui-tests.

Run tests with
```bash
# Run chromedriver in a separate terminal session
./node_modules/.bin/chromedriver --url-base=wd/hub --port=9515 --verbose
```

Compile and execute tests
```bash
npm run build
node dist/src/spec/webdriverio.js
```