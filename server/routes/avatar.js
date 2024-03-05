const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController.js');

router.get('/', avatarController.getAllUsers);
router.post('/', avatarController.getUserByUsername);

module.exports = router;
