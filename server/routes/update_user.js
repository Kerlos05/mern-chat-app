const express = require('express');
const router = express.Router();
const {updateUserController, deleteUserController} = require('../controllers/updateUserController');


router.put('/', updateUserController); 
router.delete('/', deleteUserController); 


module.exports = router;