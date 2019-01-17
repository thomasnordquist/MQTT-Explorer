# MQTT-Explorer
[![Downloads](https://github-basic-badges.herokuapp.com/release/thomasnordquist/MQTT-Explorer.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Downloads](https://github-basic-badges.herokuapp.com/downloads/thomasnordquist/MQTT-Explorer/total.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Build Status](https://travis-ci.org/thomasnordquist/MQTT-Explorer.svg?branch=master)](https://travis-ci.org/thomasnordquist/MQTT-Explorer)

### Version {{ version }}
See the whole picture of your message queue.
The perfect tool to integrate new services, IoT devices in your network.
This application subscribes to all topics on your MQTT-Server and displays your message queue hierarchy, allowing you to drill-down to the topics that are of interest.

## Download
The app is prebuilt for Windows ({{windowsTargets}}), Linux ({{linuxTargets}}) and Mac ({{macTargets}}).

More architectures and package types: [Downloads](https://github.com/thomasnordquist/MQTT-Explorer/releases)

![screen2](https://user-images.githubusercontent.com/7721625/51109225-dbe22200-17f4-11e9-8f6b-c6a27c07c90e.png)

## Develop
PRs and issues are welcome

Install with `npm run install`, build with `npm run build`

Start with `npm run start`

The `app` directory contains all the rendering logic, the `backend` directory currently contains the models, tests, connection management.

## License
Not yet decided which license exactly, but the basic idea is: "You may do whatever you want with this tool, except sell it."
