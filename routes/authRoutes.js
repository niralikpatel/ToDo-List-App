const express = require('express')
const router = express.Router();
const jwt = require("jsonwebtoken")
const { authenticateToken } = require("utilities")

const User = require('../models/users.js')

router.post('register', async (req, res)=>{
    const { firstName, lastName, email, password } = req.body;
    try{
        const duplicate = await User.findOne({email})
        if(duplicate && duplicate.length > 0){
            return res.status(400).json({message: "User already exists."})
        }
        const user = new User({
            firstName, lastName, email, password
        });
        await user.save();

        //JWT Authentication
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "72h",
            }
        );
        res.status(201).json({
            error: false,
            user: { firstName: user.firstName, lastName: user.lastName, email: user.email, password: user.password },
            accessToken,
            message: "User Registered Successfully",
        });
    }catch(error){
        console.log(error)
        res.status(400).send(error);
    }
    // console.log(data);
    // res.send("success")
})

module.exports = router;