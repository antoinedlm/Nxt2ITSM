const url = require('url');
const axios = require('axios');

const utils = require('../utils/utils');
const config = require('../config/config');

const path = require('path');
const fs = require('fs');
const https = require('https');

var httpsAgent;
if (config.ssl.caBundleName) {
    const caBundle = path.join(utils.rootDir, 'ssl', config.ssl.caBundleName);
    httpsAgent = new https.Agent({ ca: fs.readFileSync(caBundle) });
} else {
    httpsAgent = new https.Agent({ rejectUnauthorized: false });
};

config.properties = Object.assign({
    name: ['Name', 'string'],
    last_seen: ['Last Seen', 'datetime'],
    device_uid: ['Device UID', 'md5']
}, config.properties);

var propertiesFields = Object.keys(config.properties).join(' ');

exports.callActAPI = (remoteUid, deviceUid) => {
    var data = {
        RemoteActionUid: remoteUid,
        DeviceUids: [deviceUid]
    };

    var options = {
        baseURL: 'https://'.concat(config.api.portal),
        method: 'post',
        url: '/api/remoteaction/v1/run',
        data: data,
        headers: {
            'Content-type': 'application/json'
        },
        auth: {
            username: config.api.username,
            password: config.api.password
        }
    };

    console.log('Sending Post request to Act API with following options:');
    console.log('\tBaseURL:', options.baseURL);
    console.log('\tURL:', options.url);
    console.log('\tData:', options.data);

    return axios(options);
};

exports.getDevices = async () => {
    var engines = [];
    var promises;
    await callEngineAPI()
        .then((response) => {
            for (engine in response.data) {
                if (response.data[engine].status === 'CONNECTED') {
                    engines.push({
                        name: response.data[engine].name,
                        address: response.data[engine].address
                    });
                };
            };
            console.log('Connected Engines:');
            console.table(engines);
            promises = engines.map(getDevicesNXQL);

        })
        .catch((error) => {
            console.error('Error retrieving Engine:', error);
            return error;
        });
    const allDevices = await parseDevices(promises);
    return allDevices;
};

exports.runNXQL = (deviceName, scoreFields, engineAddress) => {
    var allFields = [propertiesFields, scoreFields].join(' ');
    var selectStatement = '(select('.concat(allFields, ')(from device(where device(eq name(pattern "', deviceName, '")))))');
    var format = '&format=json';
    var nxqlQuery = '/2/query?platform=windows&query='.concat(encodeURIComponent(selectStatement), format);

    return GetHttps(engineAddress, config.api.nxqlPort, nxqlQuery);
};

exports.parseResults = (jsonResults, scores, normObject, propObject) => {
    var parsedResults = {};
    Object.entries(jsonResults).forEach(pair => {
        var key = pair[0];
        var value = pair[1];
        var isPayload = key.includes('payload');
        var isScore = key.includes('score');

        if (isScore) {
            var scoreName = key.substring(
                key.indexOf(":") + 1,
                key.indexOf("/")
            );
            if (hasValue(value) && isPayload) {
                parsedResults[key] = normObject[key].applyNorm(value);
                console.log('CONVERTED:\t', key, 'value\n\t\t', value, 'to:', parsedResults[key]);
            } else if (isPayload) {
                parsedResults[key] = '-';
                console.log('CONVERTED:\t', key, 'value\n\t\t', value, 'to:', parsedResults[key]);
            } else if (hasValue(value) && Number.isInteger(+value)) {
                var numValue = +value;
                parsedResults[key] = [numValue, scores[scoreName].calcColor(value)];
            } else if (hasValue(value)) {
                var numValue = +value.toFixed(2);
                parsedResults[key] = [numValue, scores[scoreName].calcColor(value)];
            } else {
                parsedResults[key] = ['-', 'novalue'];
            };
        } else {
            parsedResults[key] = utils.transform(value, propObject[key][1]);
            console.log('CONVERTED:\t', key, 'value\n\t\t', value, 'to:', parsedResults[key]);
        };

    });
    return parsedResults;
};

GetHttps = (host, port, url) => {
    var options = {
        baseURL: 'https://'.concat(host, ':', port),
        method: 'get',
        url: url,
        auth: {
            username: config.api.username,
            password: config.api.password
        },
    };

    console.log('Sending Get request with following options:');
    console.log('\tHost:', options.baseURL);
    console.log('\tURL:', options.url);

    return axios(options)
};

callEngineAPI = () => {
    var url = '/api/configuration/v1/engines';
    console.log('Retrieving Engines from Portal API');
    return GetHttps(config.api.portal, 443, url);
};

getDevicesNXQL = (engine) => {
    var url = encodeURI('/2/query?platform=windows&query=(select(name)(from device))&format=json');
    console.log('Retrieving devices on Engine:', engine.address);
    return GetHttps(engine.address, config.api.nxqlPort, url);
};

parseDevices = async (promises) => {
    var devices = {};
    await axios.all(promises)
        .then(axios.spread((...responses) => {
            for (index in responses) {
                var host = url.parse(responses[index].config.baseURL).hostname;
                console.log('Status code:', responses[index].status);
                if (responses[index].status == '200') {
                    var jsonContent = responses[index].data;
                    for (device in jsonContent) {
                        var name = jsonContent[device].name.toLowerCase();
                        devices[name] = host;
                    };
                    console.log('Parsing of devices for Engine:', host, 'done');
                } else if (responses[index].status == '400') {
                    console.error('Error getting devices on Engine:', host, 'Bad Request');
                } else if (responses[index].status == '401') {
                    console.error('Error getting devices on Engine:', host, 'Not Authorized');
                } else if (responses[index].status == '403') {
                    console.error('Error getting devices on Engine:', host, 'Forbidden');
                } else {
                    console.error('Error getting devices on Engine:', host, 'Status code:', responses[index].status);
                };
            };
        }))
        .catch((error) => {
            console.error('Error retrieving devices:', error);
            return error
        });
    return devices;
}

hasValue = data => {
    if (data !== null && data !== '') {
        return true;
    } else {
        return false;
    }
};

