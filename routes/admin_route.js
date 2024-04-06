const  express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const AdminModel = mongoose.model("AdminModel");
const {JWT_ADMIN} = require('../config');
const adminRoute = require('../middleware/adminMiddleware');

router.post('/adminSignup', (req,res)=> {
    const {fullName, email, password, phoneNumber} = req.body;
    if(!fullName || !password || !email){
        return res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    AdminModel.findOne({email: email})
    .then((userInDB)=> {
        if(userInDB){
            return res.status(500).json({error: "User with this email already registered"});
        }
        bcryptjs.hash(password, 16)
        .then((hashPassword)=> {
            const user = new AdminModel({fullName, email, password: hashPassword, phoneNumber});
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

router.post('/adminLogin', (req,res)=> {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    AdminModel.findOne({email: email})
    .then((userInDB)=> {
        if(!userInDB){
            res.status(401).json({error: "Invalid Credentials"});
        }
        bcryptjs.compare(password, userInDB.password)
        .then((didMatch)=> {
            if(didMatch){
                const jwtToken = jwt.sign({_id: userInDB._id}, JWT_ADMIN);
                const adminInfo = {"_id": userInDB._id,"email": userInDB.email, "fullName": userInDB.fullName};

                res.status(200).json({result: {adminToken: jwtToken, admin: adminInfo}});
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

router.get("/admininfo/:id", adminRoute, (req, res)=> {
    AdminModel.find({_id: req.params.id})
    .select("fullName email phoneNumber")
    .then((dbUser)=> {
        res.status(200).json({User: dbUser})
    })
    .catch((error)=> {
        console.log(error);
    })
});

router.put("/updateadmin", adminRoute , async (req,res)=> {
    const {fullName,email, password, phoneNumber, profileImg} = req.body;
    if(!fullName || !password || !email || !phoneNumber){
        return res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    try {
        const adminFound = await AdminModel.findOne({_id: req.body.adminId})
        .populate("_id");
        if(!adminFound){
            res.status(400).json({error: "User does not exist"});
        }
        //Proceed with the update
        bcryptjs.hash(password, 16)
        .then(async (hashPassword)=> {
            await adminFound.updateOne({fullName, email, password: hashPassword, phoneNumber, profileImg});
            res.status(200).json({result: adminFound});
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