# MQTT-Explorer
[![Downloads](https://github-basic-badges.herokuapp.com/release/thomasnordquist/MQTT-Explorer.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Downloads](https://img.shields.io/github/downloads/thomasnordquist/mqtt-explorer/total.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Build Status](https://travis-ci.org/thomasnordquist/MQTT-Explorer.svg?branch=master)](https://travis-ci.org/thomasnordquist/MQTT-Explorer)

### Version {{ version }}
See the whole picture of your message queue.
The perfect tool to integrate new services, IoT devices in your network.
This application subscribes to all topics on your MQTT-Server and displays your message queue hierarchy, allowing you to drill-down to the topics that are of interest.

## Download
The app is prebuilt for Windows ({{windowsTargets}}), Linux ({{linuxTargets}}) and Mac ({{macTargets}}).

<center>

| | | | 
|:----------|:-------------:|:------:|
| ![windows](https://user-images.githubusercontent.com/7721625/51445407-b4172080-1d04-11e9-8c70-d8413d1d6d8b.png) | Windows | {{windowsTargets}} |
| ![linux](https://user-images.githubusercontent.com/7721625/51445392-947ff800-1d04-11e9-8c7f-a30efb755651.png) | Linux | {{linuxTargets}}<br>*Run AppImage:<br>Make it executable and double-click it.* | 
| ![mac](https://user-images.githubusercontent.com/7721625/51445390-921d9e00-1d04-11e9-8339-351469ef20ae.png) | Mac | {{macTargets}} | 

</center>

More architectures and package types: [Downloads](https://github.com/thomasnordquist/MQTT-Explorer/releases)

![screen1](https://user-images.githubusercontent.com/7721625/51441563-41418180-1cd3-11e9-893b-c22f6a6c3695.png)

![screen2](https://user-images.githubusercontent.com/7721625/51441470-59fd6780-1cd2-11e9-925f-bc491027300c.png)


## Develop
PRs and issues are welcome

Install with `npm run install`, build with `npm run build`

Start with `npm run start`

The `app` directory contains all the rendering logic, the `backend` directory currently contains the models, tests, connection management.

## License
Not yet decided which license exactly, but the basic idea is: "You may do whatever you want with this tool, except sell it."
