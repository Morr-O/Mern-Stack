const jwt = require("jsonwebtoken")
const bcyrpt=require('bcryptjs')
const asyncHandler =require('express-async-Handler')
const User =require('../models/userModel')

//@des Register New User 
//@route POST /api/users
//@access Public
const registerUser = asyncHandler(async(req, res) =>{
    const {name, email, password} = req.body
    if(!name || !email || !password){
        res.status(400)
        throw new Error ('Please add all fileds')
    }
    //Check if user exists
    const userExists = await User.findOne({email})

    if (userExists){
        res.status(400)
        throw new Error('User already exists')
    }

    //Hash Password
    const salt = await bcyrpt.genSalt(10)
    const hashedPassword = await bcyrpt.hash(password, salt)
    //create user
    const user =await User.create({
        name, email, password: hashedPassword
    })
    if(user){
        res.status(201).json({
            _id:user.id,
            name: user.name,
            email:user.email,
            token: generateToken(user._id)
    })
    }
    else{
        res.status(400)
        throw new Error ('Invalid User Data')
    }
})

//@des Authenticate a User 
//@route POST /api/login
//@access Public
const loginUser =asyncHandler(async(req, res) =>{
    const {email, password} =req.body

    //check for user email
    const user =await User.findOne({email})

    if(user && (await bcyrpt.compare(password, user.password)))
    res.json({
        _id:user._id,
        name: user.name,
        email:user.email,
        token: generateToken(user._id)
    })
    else{
        res.status(400)
        throw new Error('Invalid log in details')
    }
})

//@des Register New User 
//@route GET /api/users/me
//@access Public
const getMe =asyncHandler( async(req, res) =>{
    const {_id, name, email} = await User.findById(req.user.id)
    res.status(200)
    id: _id,
    name,
    email
})

   //generate token
   const generateToken =(id) =>{
       return jwt.sign({id}, process.env.JWT_SECRET,{
            expiresIn: '30d'})
   }


module.exports={
    registerUser,
    loginUser,
    getMe,
}
