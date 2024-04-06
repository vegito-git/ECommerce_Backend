const  express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const UserModel = mongoose.model("UserModel");
const {JWT_SECRET} = require('../config');
const adminRoute = require('../middleware/adminMiddleware'); 
const protectedRoute = require('../middleware/protectedResource'); 

router.post('/signup', (req,res)=> {
    const {fullName, email, password, phoneNumber} = req.body;
    if(!fullName || !password || !email || !phoneNumber){
        return res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    UserModel.findOne({email: email})
    .then((userInDB)=> {
        if(userInDB){
            return res.status(500).json({error: "User with this email already registered"});
        }
        bcryptjs.hash(password, 16)
        .then((hashPassword)=> {
            const user = new UserModel({fullName, email, password: hashPassword, phoneNumber});
            user.save()
            .then((newUser)=> {
                res.status(201).json({result: "User Signed Successfully!!"});
            })
            .catch((err)=> {
                console.log(err);
            })
        })
        .catch((err)=> {
            console.log(err);
        })
    })
    .catch((err)=> {
        console.log(err);
    })
});

router.post('/login', (req,res)=> {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    UserModel.findOne({email: email})
    .then((userInDB)=> {
        if(!userInDB){
            res.status(401).json({error: "Invalid Credentials"});
        }
        bcryptjs.compare(password, userInDB.password)
        .then((didMatch)=> {
            if(didMatch){
                const jwtToken = jwt.sign({_id: userInDB._id}, JWT_SECRET);
                const userInfo = {"_id": userInDB._id,"email": userInDB.email, "fullName": userInDB.fullName};

                res.status(200).json({result: {token: jwtToken, user: userInfo}});
            }else{
                res.status(401).json({error: "Invalid Credentials"});
            }
        })
        .catch((err)=> {
            console.log(err);
        })
    })
    .catch((err)=> {
        console.log(err);
    })
});

router.get("/userinfo/:id", (req, res)=> {
    UserModel.find({_id: req.params.id})
    .select("fullName email phoneNumber adress orders")
    .then((dbUser)=> {
        res.status(200).json({User: dbUser})
    })
    .catch((error)=> {
        console.log(error);
    })
});

router.put("/updateuser", protectedRoute , async (req,res)=> {
    const {fullName,email, password, phoneNumber, profileImg} = req.body;
    if(!fullName || !password || !email || !phoneNumber){
        return res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    try {
        const userFound = await UserModel.findOne({_id: req.body.userId})
        .populate("_id");
        if(!userFound){
            res.status(400).json({error: "User does not exist"});
        }
        //Proceed with the update
        bcryptjs.hash(password, 16)
        .then(async (hashPassword)=> {
            await userFound.updateOne({fullName, email, password: hashPassword, phoneNumber, profileImg});
            res.status(200).json({result: userFound});
        })
        .catch((err)=> {
            console.log(err);
        })
    }catch (error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

router.get("/useraddress/:id", protectedRoute, (req, res)=> {
    UserModel.find({_id: req.params.id})
    .select("address")
    .then((dbUser)=> {
        res.status(200).json({User: dbUser})
    })
    .catch((error)=> {
        console.log(error);
    })
});

router.put("/updateaddress", protectedRoute , async (req,res)=> {
    const userAddress =  {addressName: req.body.addressName,houseNo: req.body.houseNo, area: req.body.area, city: req.body.city, country: req.body.country, pinCode:req.body.pinCode, phoneNumber: req.body.phoneNumber};
    try {
        const userFound = await UserModel.findOne({_id: req.body.userId})
        .populate("_id");
        if(!userFound){
            res.status(400).json({error: "User does not exist"});
        }
        //Proceed with the update
        await userFound.updateOne({address: userAddress});
        res.status(200).json({result: userFound});
    }catch (error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

//For ADMIN to manage users............

router.get("/allusers", adminRoute, (req, res)=> {
    UserModel.find()
    .populate()
    .then((dbUsers)=> {
        res.status(200).json({Users: dbUsers})
    })
    .catch((error)=> {
        console.log(error);
    })
});

router.delete("/deleteuser/:userId", adminRoute, async (req,res)=> {
    try {
        const user = await UserModel.findOne({_id: req.params.userId})
        .populate("_id");
        if(!user){
            res.status(400).json({error: "User does not exist"});
        }
        //Proceed with deletion
        const deleteUser = user;
        await user.deleteOne();
        res.status(200).json({result: deleteUser});
    }catch (error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

// I tried using (protectedRoute || adminRoute) without creating a differnt API to update user for ADMIN, but it didn't work.

router.put("/adminupdateuser", adminRoute , async (req,res)=> {
    const {fullName, email, password, phoneNumber, profileImg} = req.body;
    try {
        const userFound = await UserModel.findOne({_id: req.body.userId})
        .populate("_id");
        if(!userFound){
            res.status(400).json({error: "Item does not exist"});
        }
        //Proceed with the update
        bcryptjs.hash(password, 16)
        .then(async (hashPassword)=> {
            await userFound.updateOne({fullName, email, password: hashPassword, phoneNumber, profileImg});
            res.status(200).json({result: userFound});
        })
        .catch((err)=> {
            console.log(err);
        })
    }catch (error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

module.exports = router;
