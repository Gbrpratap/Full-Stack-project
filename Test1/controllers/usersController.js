const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private

const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({ message: 'No Users Found'})
    }
    res.json(users)
})


// @desc Create new user
// @route POST /users
// @access Private

const createUser = asyncHandler(async(req, res) => {
    const { username, password, role } = req.body

    // Checking User Input Data
    if(!username || !password || !Array.isArray(role) || !role.length){
        return res.status(400).json({ message: '*All fields are required'})
    }

    //Check for user duplication
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate){
        return res.status(409).json({ message: 'Duplicate User name'})
    }

    //Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10) // salt rounds

    const userObject = { username, "password": hashedPassword, role}

    // Create and store new user
    const user = await User.create(userObject)

    if(user){
        //Created
        res.status(201).json({ message: `New user ${username} created Successfully!`})
    }else{
        res.status(400).json({ message: 'Invalid user data received'})
    }
})

// @desc Update a user
// @route PATCH /users
// @access Private

const updateUser = asyncHandler(async(req, res) => {
    const { id, username, role, active, password} = req.body

    //Confirming the data
    if(!id || !username || !Array.isArray(role) || !role.length || typeof active !== 'boolean'){
        return res.status(400).json({ message: '*All fields are required'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({ message: 'User not found'})
    }

    //checking for duplication
    const duplicate = await User.findOne({ username }).lean().exec()

    //Allow updated to the current/original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username'})
    }

    user.username = username
    user.role = role
    user.active = active

    if(password){
        //hasing the password in updates field
        user.password = await bcrypt.hash(password, 10) //salt rounds
    }

    const updateUser = await user.save()

    res.json({ message: `${updateUser.username} Updated Successfully!`})
})

// @desc Delete a user
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async(req, res) => {
    const { id } = req.body

    if(!id){
        return res.status(400).json({ message: 'User ID Required'})
    }

    const note = await Note.findOne({ user: id }).lean().exec()
    if(note?.length){
        return res.status(400).json({ message: 'User has assigned note'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res .status(400).json({ message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID: ${result.id} deleted sucessfully!`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}