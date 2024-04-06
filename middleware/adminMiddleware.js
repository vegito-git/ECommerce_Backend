const jwt = require('jsonwebtoken');
const {JWT_ADMIN} = require('../config');

const mongoose = require('mongoose');
const AdminModel = mongoose.model('AdminModel');

module.exports = (req,res,next)=> {
    const {authorization} = req.headers;
    //Bearer fgdf....
    if(!authorization){
        return res.status(401).json({error: "User not logged in"});
    }
    const adminToken = authorization.replace("Bearer ", "");
    jwt.verify(adminToken, JWT_ADMIN, (error, payload)=> {
        if(error){
            return res.status(401).json({error: "User not logged in"});
        }
        const {_id} = payload;
        AdminModel.findById(_id)
        .then((dbUser)=> {
            req.user = dbUser;
            next();  //goes to the next middleware or the REST API
        })
    });
}
