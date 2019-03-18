# [MQTT Explorer](https://thomasnordquist.github.io/MQTT-Explorer/)

[![Downloads](https://img.shields.io/github/release/thomasnordquist/mqtt-explorer.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Downloads](https://img.shields.io/github/downloads/thomasnordquist/mqtt-explorer/total.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Build_Status](https://travis-ci.org/thomasnordquist/MQTT-Explorer.svg?branch=master)](https://travis-ci.org/thomasnordquist/MQTT-Explorer)
[![Build status](https://ci.appveyor.com/api/projects/status/c35tkm29rm4m5364/branch/master?svg=true)](https://ci.appveyor.com/project/thomasnordquist/mqtt-explorer/branch/master)

|   |   |   |
|:---:|:---:|:---:|
| [![screen1_small](https://user-images.githubusercontent.com/7721625/53954800-84b34c00-40d7-11e9-842d-bf655c569600.jpg)](https://user-images.githubusercontent.com/7721625/53954364-52551f00-40d6-11e9-93cf-d5a9601897ea.png) | [![screen2_small](https://user-images.githubusercontent.com/7721625/53954801-84b34c00-40d7-11e9-913a-42572e675620.jpg)](https://user-images.githubusercontent.com/7721625/53954365-52551f00-40d6-11e9-823f-afd66f19ed01.png) | [![screen3_small](https://user-images.githubusercontent.com/7721625/53954802-854be280-40d7-11e9-973c-08f23c8dbf89.jpg)](https://user-images.githubusercontent.com/7721625/53954366-52551f00-40d6-11e9-9738-74db830d03ac.png) |

## Version {{ version }}

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

Developing this tool takes a lot of effort, sweat and time, please consider rating the App on the Windows or Mac app store <img src="./res/star.svg" width="16" /><img src="./res/star.svg" width="16" /><img src="./res/star.svg" width="16" /><img src="./res/star.svg" width="16" /><img src="./res/star.svg" width="16" />.  
If you feel like a feature is missing or you found a bug, please leave me a [comment / issue](https://github.com/thomasnordquist/MQTT-Explorer/issues) and I'll see what I can do.

| Platform | | Downloads |
|:----------:|:-------------:|:------:|
| ![windows](https://user-images.githubusercontent.com/7721625/51445407-b4172080-1d04-11e9-8c70-d8413d1d6d8b.png) | **Windows** | <a href="https://www.microsoft.com/store/apps/9PP8SFM082WD?ocid=badge"><img src="https://assets.windowsphone.com/85864462-9c82-451e-9355-a3d5f874397a/English_get-it-from-MS_InvariantCulture_Default.png" width="165" /></a><br />**{{windowsTargets}}** |
| ![mac](https://user-images.githubusercontent.com/7721625/51445390-921d9e00-1d04-11e9-8339-351469ef20ae.png) | **Mac** | <a href="https://geo.itunes.apple.com/us/app/mqtt-explorer/id1455214828?mt=12&app=apps"><img src="https://linkmaker.itunes.apple.com/en-us/badge-lrg.svg?releaseDate=2019-03-07T00:00:00Z&kind=desktopapp&bubble=macos_apps" width="165" height="40"/></a><br />**{{macTargets}}** |
| ![ubuntu](https://user-images.githubusercontent.com/7721625/51445401-a5306e00-1d04-11e9-9b9b-20e196b82142.png) | **Ubuntu**<br />*also for debian, mint, neon, fedora, etc...* | <a href="https://snapcraft.io/mqtt-explorer" title="Get it from the Snap Store"><img src="https://snapcraft.io/static/images/badges/en/snap-store-black.svg" width="165" /></a><br />`snap install mqtt-explorer`<br />[Ubuntu Store](snap://mqtt-explorer) |
| ![linux](https://user-images.githubusercontent.com/7721625/51445392-947ff800-1d04-11e9-8c7f-a30efb755651.png) | **Linux**<br />*almost every linux* | **{{linuxTargets}}**<br />*Run AppImage:<br />Make it executable and double-click it.* |

[More Downloads](https://github.com/thomasnordquist/MQTT-Explorer/releases)

## Video

![screencast](https://user-images.githubusercontent.com/7721625/53954172-b7f4db80-40d5-11e9-852c-f8d85e511a00.gif)

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
<summary>Example telemetry
</summary>

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

</details>

Even thoug the data is purely technical, an option to disable telemetry is planned. [#52](https://github.com/thomasnordquist/MQTT-Explorer/issues/52)

## License
[AGPL 3](./LICENSE)
