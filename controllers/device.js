const path = require('path');
const fs = require('fs');

const utils = require('../utils/utils');
const Score = require(path.join(utils.rootDir, 'models', 'scoreDef'));
const nxtAPI = require(path.join(utils.rootDir, 'models', 'nxtAPI'));
const config = require(path.join(utils.rootDir, 'config', 'config'));
const scoresPath = path.join(utils.rootDir, 'scores');

var scoresList;
var scoresContent;
var devicesList = {};

const parseScores = () => {
    console.log('Parsing scores...');
    scoresList = fs.readdirSync(scoresPath, { encoding: 'utf-8' });
    scoresContent = {};
    for (index in scoresList) {
        if (path.extname(scoresList[index]) === 'xml') {
            var currentScore = new Score(path.join(scoresPath, scoresList[index]));
            scoresContent[currentScore.name] = currentScore;
        };
    };
};

refreshDevices = async () => {
    try {
        devicesList = await nxtAPI.getDevices();
    } catch (err) {
        console.error(err.message);
    };
};

parseScores();
setInterval(parseScores, config.app.scoreRefresh * 60 * 1000);

refreshDevices();
setInterval(refreshDevices, config.app.deviceRefresh * 60 * 1000);

exports.getIndex = (req, res) => {
    console.log('Accessing index route');
    res.render('index', {
        pageName: config.app.name,
        hostname: req.hostname,
        scores: scoresList,
    });

};

exports.getDevicesList = async (req, res) => {
    console.log('Serving devices list');
    if (devicesList) {
        res.send(devicesList);
    };
};

exports.getDevice = async (req, res) => {
    console.log('Accessing device route');
    var deviceName = req.params.deviceId.toLowerCase();
    var engine = devicesList[deviceName];
    var fields = [];
    var normalizations = {};
    Object.keys(scoresContent).forEach(key => {
        fields.push(scoresContent[key].selectString);
        Object.assign(normalizations, scoresContent[key].normalizations);
    });
    await nxtAPI.runNXQL(deviceName, fields.join(' '), engine)
        .then((response) => {
            console.log('NXQL query results:');
            console.table(response.data[0]);
            var parsed = nxtAPI.parseResults(response.data[0], scoresContent, normalizations, config.properties);
            res.render('device', {
                deviceName: deviceName,
                engine: engine,
                scores: scoresContent,
                config: config,
                payload: parsed
            });
        })
        .catch((error) => {
            console.error('Error rendering device route:', error);
            res.send(error);
        });
};

exports.getScore = async (req, res) => {
    console.log('Accessing score route');
    var scoreName = Object.keys(scoresContent)[req.params.scoreId];
    var deviceName = req.params.deviceId.toLowerCase();
    var engine = devicesList[deviceName];
    var fields = [];
    var normalizations = scoresContent[scoreName].normalizations;
    fields.push(scoresContent[scoreName].selectString);
    await nxtAPI.runNXQL(deviceName, fields.join(' '), engine)
        .then((response) => {
            console.log('NXQL query results:');
            console.table(response.data[0]);
            var parsed = nxtAPI.parseResults(response.data[0], scoresContent, normalizations, config.properties);
            res.render('device', {
                deviceName: deviceName,
                engine: engine,
                scores: [scoresContent[scoreName]],
                config: config,
                payload: parsed
            });
        })
        .catch((error) => {
            console.error('Error rendering score route:', error);
            res.send(error);
        });
};

exports.getAct = async (req, res) => {
    console.log('Calling Act API');
    await nxtAPI.callActAPI(req.params.actUid, req.params.deviceUid)
        .then((response) => {
            console.log('Response from Act API:', response.data);
            res.send(response.data);
        })
        .catch((error) => {
            console.error('Error calling Act API:', error);
            res.send(error);
        });
};