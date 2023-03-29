const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')

router.route('/')
    .post(usersController.createUser)     //Create
    .get(usersController.getAllUsers)      //Readd
    .patch(usersController.updateUser)    //Update
    .delete(usersController.deleteUser)   // Delete

module.exports = router


