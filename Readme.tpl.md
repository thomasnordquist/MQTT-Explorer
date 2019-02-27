# [MQTT Explorer](https://thomasnordquist.github.io/MQTT-Explorer/)
[![Downloads](https://img.shields.io/github/release/thomasnordquist/mqtt-explorer.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Downloads](https://img.shields.io/github/downloads/thomasnordquist/mqtt-explorer/total.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Build_Status](https://travis-ci.org/thomasnordquist/MQTT-Explorer.svg?branch=master)](https://travis-ci.org/thomasnordquist/MQTT-Explorer)
[![Build status](https://ci.appveyor.com/api/projects/status/c35tkm29rm4m5364/branch/master?svg=true)](https://ci.appveyor.com/project/thomasnordquist/mqtt-explorer/branch/master)

### Version {{ version }}

A MQTT Tool to get a quick overview of your MQTT topics and integrate new devices/services more efficiently.

- Visualize topics and topic activity
- Delete retained topics
- Search/filter topics
- Delete topic recursively
- Publish topics
- Plot numeric topics
- Keep a history of each topic

MQTT-Explorer strives to be THE swiss-army-knife tool.
The perfect tool to integrate new services, IoT devices in your network.
The hierarchical view allows for a quick understanding what is going on on your broker.

## Download

| Platform | | Downloads |
|:----------:|:-------------:|:------:|
| ![windows](https://user-images.githubusercontent.com/7721625/51445407-b4172080-1d04-11e9-8c70-d8413d1d6d8b.png) | Windows | <a href="https://www.microsoft.com/store/apps/9PP8SFM082WD?ocid=badge"><img src="https://assets.windowsphone.com/85864462-9c82-451e-9355-a3d5f874397a/English_get-it-from-MS_InvariantCulture_Default.png" width="150" /></a><br/>{{windowsTargets}} |
| ![linux](https://user-images.githubusercontent.com/7721625/51445392-947ff800-1d04-11e9-8c7f-a30efb755651.png) | Linux | {{linuxTargets}}<br>*Run AppImage:<br>Make it executable and double-click it.* |
| ![ubuntu](https://user-images.githubusercontent.com/7721625/51445401-a5306e00-1d04-11e9-9b9b-20e196b82142.png) | Ubuntu | <a href="https://snapcraft.io/mqtt-explorer" title="Get it from the Snap Store"><img src="https://snapcraft.io/static/images/badges/en/snap-store-black.svg" width="150" /><br/>[Ubuntu Store](snap://mqtt-explorer) |
| ![mac](https://user-images.githubusercontent.com/7721625/51445390-921d9e00-1d04-11e9-8339-351469ef20ae.png) | Mac | {{macTargets}} |

[More Downloads](https://github.com/thomasnordquist/MQTT-Explorer/releases)

## Screenshots
![screen1](https://user-images.githubusercontent.com/7721625/51770198-6c6a0d80-20e5-11e9-94d5-a0174634253c.png)

## Demo
![screencast](https://user-images.githubusercontent.com/7721625/52979302-3f073b80-33d5-11e9-9953-b70ebb349439.gif)

## Performance
This App is optimized to handle thousands of topics and at least hundreds of thousands messages per minute.
So don't worry if you got >=30k topics and >=100.000 messages per minute.

One can also subscribe to custom topics insted of the "root wildcard #", therefore limiting the amount of messages.

## Develop
PRs and issues are welcome

Install with `npm run install`, build with `npm run build`

Start with `npm run start`

The `app` directory contains all the rendering logic, the `backend` directory currently contains the models, tests, connection management.

## Automated Tests
To achieve a reliable product automated tests run regulary on travis.
- Data model
- MQTT integration
- UI-Tests (The demo is a recorded ui test)

## Telemetry
The App sends telemetry and error reports, this enables me to quickly react on bugs/errors I produced.
This is a difficutlt task since this App runs on three different operating systems and architectures.

It basically sends: app version, processor architecture, operating system, used memory, user interactions and error stacks.

This greatly helps to improve the software quality and reliability.
No data about you or your data is send or stored.
Even thoug the data is purely technical, an option to disable telemetry is planned. [#52](https://github.com/thomasnordquist/MQTT-Explorer/issues/52)

Example telemetry:
```javascript
{ system: { arch: 'x64', platform: 'darwin' },
  appVersion: '0.0.7',
  events: { HELLO_EVENT: [ 1547714886134 ] },
  now: 1547714886135,
  transactionId: '1767d251-f492-4f2c-aa62-88add3acc26b' }
{ errors:
   [ { time: 1547714887921,
       message: 'He\'s dead Jim!',
       stack:
        'Error: He\'s dead Jim!\n    at ./src/tracking.ts.exports.default (./mqtt-explorer/app/build/bundle.js:142765:11)\n    at new Promise (<anonymous>)\n    at Object../src/tracking.ts (./mqtt-explorer/app/build/bundle.js:142764:1)\n    at __webpack_require__ (./mqtt-explorer/app/build/bundle.js:20:30)\n    at Object../src/index.tsx (./mqtt-explorer/app/build/bundle.js:142618:1)\n    at __webpack_require__ (./mqtt-explorer/app/build/bundle.js:20:30)\n    at ../backend/node_modules/charenc/charenc.js.charenc.utf8.stringToBytes (./mqtt-explorer/app/build/bundle.js:84:18)\n    at ./mqtt-explorer/app/build/bundle.js:87:10' } ],
  now: 1547714887921,
  transactionId: '53bf9aac-e695-40cc-9a81-b1cf3398843d' }
```

## License
[AGPL 3](./LICENSE)
