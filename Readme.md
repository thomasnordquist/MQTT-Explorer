# [MQTT Explorer](https://thomasnordquist.github.io/MQTT-Explorer/)
[![Downloads](https://img.shields.io/github/release/thomasnordquist/mqtt-explorer.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Downloads](https://img.shields.io/github/downloads/thomasnordquist/mqtt-explorer/total.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Build_Status](https://travis-ci.org/thomasnordquist/MQTT-Explorer.svg?branch=master)](https://travis-ci.org/thomasnordquist/MQTT-Explorer)
[![Build status](https://ci.appveyor.com/api/projects/status/c35tkm29rm4m5364/branch/master?svg=true)](https://ci.appveyor.com/project/thomasnordquist/mqtt-explorer/branch/master)

### Version 

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
| ![windows](https://user-images.githubusercontent.com/7721625/51445407-b4172080-1d04-11e9-8c70-d8413d1d6d8b.png) | Windows | [portable](https:&#x2F;&#x2F;github.com&#x2F;thomasnordquist&#x2F;MQTT-Explorer&#x2F;releases&#x2F;download&#x2F;v0.2.0&#x2F;MQTT-Explorer-0.2.0.exe), [installer](https:&#x2F;&#x2F;github.com&#x2F;thomasnordquist&#x2F;MQTT-Explorer&#x2F;releases&#x2F;download&#x2F;v0.2.0&#x2F;MQTT-Explorer-Setup-0.2.0.exe) |
| ![linux](https://user-images.githubusercontent.com/7721625/51445392-947ff800-1d04-11e9-8c7f-a30efb755651.png) | Linux | [AppImage](https:&#x2F;&#x2F;github.com&#x2F;thomasnordquist&#x2F;MQTT-Explorer&#x2F;releases&#x2F;download&#x2F;v0.2.0&#x2F;MQTT-Explorer-0.2.0-x86_64.AppImage)<br>*Run AppImage:<br>Make it executable and double-click it.* |
| ![ubuntu](https://user-images.githubusercontent.com/7721625/51445401-a5306e00-1d04-11e9-9b9b-20e196b82142.png) | Ubuntu | [![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/mqtt-explorer)<br>[Ubuntu Store](snap://mqtt-explorer) |
| ![mac](https://user-images.githubusercontent.com/7721625/51445390-921d9e00-1d04-11e9-8339-351469ef20ae.png) | Mac | [dmg](https:&#x2F;&#x2F;github.com&#x2F;thomasnordquist&#x2F;MQTT-Explorer&#x2F;releases&#x2F;download&#x2F;v0.2.0&#x2F;MQTT-Explorer-0.2.0.dmg) |

[More Downloads](https://github.com/thomasnordquist/MQTT-Explorer/releases)

## Screenshots
![screen1](https://user-images.githubusercontent.com/7721625/51770198-6c6a0d80-20e5-11e9-94d5-a0174634253c.png)

## Demo
![screencast](https://user-images.githubusercontent.com/7721625/52979302-3f073b80-33d5-11e9-9953-b70ebb349439.gif)

## Performance

This App is optimized to handle thousands of topics and at hundreds of thousands messages per minute.

In very large productive environments brokers may handle an exteme load of topics.
Subscribing with a wildcard topic is in this scenario not adviced.
To avoid a scenario where the MQTT-Explorer would have to handle millions of updates, one can set up custom subscriptions in the "Advanced" connection settings.

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

No personal data is processed, sent or stored.

The app sends telemetry and error reports, this enables me to quickly react on bugs/errors and understand what's going on.
The app runs on winows, linux and mac and has thousands of users. Responding quickly to bugs is essential.
This greatly helps to improve the software quality and reliability.

It basically sends: app version, processor architecture, operating system, used memory, user interactions and error stacks.

<details>
<summary>Example telemetry</summary>
<p>

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

</p>
</details>

Even thoug the data is purely technical, an option to disable telemetry is planned. [#52](https://github.com/thomasnordquist/MQTT-Explorer/issues/52)

## License
[AGPL 3](./LICENSE)
