const express = require('express');
const router = express.Router();

// Import Room Controller Methods
const folderControllers = require('../controllers/folderControllers');

// Associate basic router with respective controller
router.get('/',folderControllers.getLandingPage);
router.get('/folder/:name',folderControllers.enterRoom);
router.get('/folder/:name/:pass',folderControllers.enterRoom);
router.get('/files',folderControllers.getSavedFiles);

module.exports = router;
