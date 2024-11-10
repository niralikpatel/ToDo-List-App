const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
// const authRoutes = require('./routes/authRoutes')
require('dotenv').config();
const authenticateToken = require('./middleware/authJwt.js')
const User = require('./models/users.js')
const ToDo = require('./models/ToDoList.js')

const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // Allow React app origin
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

//app.use("/api", authRoutes)
// Register user 
app.post("/api/register", async (req, res)=>{
    try{
        const { firstName, lastName, email, password } = req.body;
        const isUser = await User.findOne({ email });
        if( isUser) {
            return res.status(400).json({error: true, message: "User already exists"});
        }

        const user = new User({
            firstName,
            lastName,
            email,
            password
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
});

// Login user
app.post("/api/login", async (req, res) => {
    try{
        const { email, password } = req.body;
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ message: "User NOT Found"});
        }
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return res.status(400).json({ message: "Invalid Credentials"});
        }
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "72h",
            }
        );
        let finalData = {
            userId: user?._id,
            userName: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            accessToken,
        };
        return res.json({
            message: "Login Successfull",
            finalData,
        });
    }
    catch(error){
        console.log(error)
        res.status(400).send(error);
    }
})

// Create todo
app.post("/api/todo/create-to-do", authenticateToken, async (req,res)=>{
    try{
        const data = req.body;
        const todo = new ToDo(data);
        const result = await todo.save();
        console.log(result);
        res.status(201).send({message:"Created New Task !"});

    }catch(err){
        console.log(err);
        res.status(err);
    }
})

// Get all task
app.get("/api/todo/get-all-to-do/:userId", authenticateToken, async (req,res)=>{
    let {userId} = req.params;

    try{
        const result = await ToDo.find({createdBy:userId});
        res.send(result);

    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }

})

// update task
app.patch("/api/todo/update-to-do/:id", authenticateToken, async (req,res)=>{
    try{
        const {id} = req.params;
        const data = req.body;
        const result = await ToDo.findByIdAndUpdate(id,{$set:data},{returnOriginal:false});
        console.log(result);
        res.send({message:'ToDo list Updated!'})
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
})

// Delete Task
app.delete("/api/todo/delete-to-do/:id", authenticateToken, async (req,res)=>{
    try{
        const {id} = req.params;
        const result = await ToDo.findByIdAndDelete(id);
        console.log(result);
        res.send({message:"ToDo Task Deleted!"});
    }catch(err){
        console.log(err);
        res.status(400).send(err);
    }
})

mongoose.connect(process.env.connection_string).then((result)=>{
    console.log("db connected successfully")
}).catch((err)=>{
    console.log(err);
})

app.listen(PORT, () =>{
    console.log(`server started at port ${PORT}`)
})