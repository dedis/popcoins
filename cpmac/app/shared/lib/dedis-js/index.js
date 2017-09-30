'use strict';

const dedis = exports;

dedis.version = require('./package.json').version;
dedis.crypto = require('./src/crypto.js');
dedis.misc = require('./src/misc.js');
dedis.net = require('./src/net.js');
