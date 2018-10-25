# node-bs-proxy
[![brawl stars](https://img.shields.io/badge/Brawl%20Stars-12.x-brightred.svg?style=flat%22)](https://play.google.com/store/apps/details?id=com.supercell.brawlstars&hl=en)
[![licence](https://img.shields.io/aur/license/yaourt.svg?style=flat)](https://github.com/Mahi-Uddin/node-bs-proxy/blob/master/LICENSE)

Brawl Stars Proxy - Intercepts the traffic between Brawl Stars client(s) and their servers, decrypts the protocol and decodes the messages.

Don't like NodeJs, prefer python? Get the [python proxy](https://github.com/Mahi-Uddin/TwistedProxy).

## How to use it?

### Setting up the proxy server

#### Prerequisites
* Install [nodejs](https://nodejs.org/en) (>=6.8.0)

#### Clone the code

`git clone https://github.com/Mahi-Uddin/node-bs-proxy && cd node-bs-proxy`

`npm install`

`cp settings.json.example settings.json` / `copy settings.json.example settings.json`

#### Running the proxy

  `node index`

  `node index --verbose` will display the contents of the messages on the screen as well as show debug info when messages are missing/incomplete
  
  `node index --dump ./packets` will save decrypted packets into the packets folder with a format of messageId.bin (ex: 10101.bin) -- Make sure the folder exists.
  
  `node index --replay ./packets/10101.bin` will decode the 10101 packet using definitions, useful when trying to decode a new message
  
  `node index --help` will show you the command line help
  
## What's the status?

This project is being worked on, any help is appreciated :blush:
