const path = require('path');
const fs = require('fs');
const utils = require('../utils/utils');

let propData = fs.readFileSync(path.join(utils.rootDir, 'properties.json'));

// application variables
exports.app = {
    port: process.env.PORT || 443,
    name: 'NXT2ITSM',
    scoreRefresh: process.env.SCORE_REFRESH || 60,
    deviceRefresh: process.env.DEVICE_REFRESH || 60,
    finder: process.env.FINDER || true
};

// ssl configuration. File to be placed in the ssl/ folder
exports.ssl = {
    certName: process.env.CERT_NAME,
    certContent: fs.readFileSync(path.join(utils.rootDir, 'ssl', process.env.CERT_NAME)),
    keyName: process.env.KEY_NAME,
    keyContent: fs.readFileSync(path.join(utils.rootDir, 'ssl', process.env.KEY_NAME)),
    caBundleName: process.env.CA_BUNDLE || '',
    caContent: fs.readFileSync(path.join(utils.rootDir, 'ssl', process.env.CA_BUNDLE)) || ''
};

// Information for Portal API query and NXQL queries
exports.api = {
    portal: process.env.PORTAL,
    nxqlPort: process.env.NXQL_PORT || '1671',
    username: process.env.USER_NAME,
    password: process.env.PASSWORD
};

// Properties that will appear in the properties tab
// format is nxql_field: ['Display name', 'nxql_type']
exports.properties = JSON.parse(propData);