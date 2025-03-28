const express = require('express');
const router = express.Router();

// Import Room Controller Methods
const roomControllers = require('../controllers/roomControllers');

// Associate basic router with respective controller
router.get('/',roomControllers.getLandingPage);
//router.get('/:name',roomController.enterRoom);
//router.get('/:name/:pass',roomController.enterRoom);

module.exports = router;
