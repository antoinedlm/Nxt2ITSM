const express = require('express');

const router = express.Router();

const deviceController = require('../controllers/device.js');

console.log('Registering devices routes...');

router.get('/', deviceController.getIndex);
router.get('/devicesList.json', deviceController.getDevicesList);
router.get('/device/:deviceId', deviceController.getDevice);
router.get('/score/:scoreId/:deviceId', deviceController.getScore);
router.get('/act/:deviceUid/:actUid', deviceController.getAct);

module.exports = router;