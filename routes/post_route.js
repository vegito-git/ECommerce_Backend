const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PostModel = mongoose.model('PostModel');
const adminRoute = require('../middleware/adminMiddleware');
const protectedRoute = require('../middleware/protectedResource'); 

//APIs to manage products for ADMIN................

router.post("/createproduct",adminRoute, (req,res)=> {
    const {productName,description, price, image, quantity} = req.body;
    if(!productName || !description || !price || !image || !quantity){
        res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    const postObj = new PostModel({productName, description, price, image, quantity})
    postObj.save()
    .then((newProduct)=> {
        res.status(201).json({product: newProduct});
    })
    .catch((error)=> {
        console.log(error);
    })
});

router.delete("/removeproduct/:productId", adminRoute, async (req,res)=> {
    try {
        const itemFound = await PostModel.findOne({_id: req.params.productId})
        .populate("productName", "quantity");
        if(!itemFound){
            res.status(400).json({error: "Item does not exist"});
        }
        //Proceed with deletion
        const deleteItem = itemFound;
        await itemFound.deleteOne();
        res.status(200).json({result: deleteItem});
    }catch (error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

router.put("/updateproduct", adminRoute, async (req,res)=> {
    const {productName,description, price, image, quantity} = req.body;
    try {
        const itemFound = await PostModel.findOne({_id: req.body.productId})
        .populate("productName", "quantity");
        if(!itemFound){
            res.status(400).json({error: "Item does not exist"});
        }
        //Proceed with the update
        await itemFound.updateOne({productName, description, price, image, quantity});
        res.status(200).json({result: itemFound});
    }catch (error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

router.get("/allproducts", (req, res)=> {
    PostModel.find()
    .populate("feedback")
    .then((dbProducts)=> {
        res.status(200).json({products: dbProducts})
    })
    .catch((error)=> {
        console.log(error);
    })
});

router.get("/productdetails/:productId", (req, res)=> {
    PostModel.find({_id: req.params.productId})
    .populate("feedback.feedbackBy", "_id fullName")
    .then((dbProduct)=> {
        res.status(200).json({product: dbProduct})
    })
    .catch((error)=> {
        console.log(error);
    })
});

//API for rating and comment(by user)......................................

router.put("/feedback", protectedRoute, async (req,res)=> {
    try {
        const userFeedback = {userRating: req.body.rating, commentText: req.body.commentText, feedbackBy: req.user._id};
        const result = await PostModel.findByIdAndUpdate(
            req.body.productId, 
            { $push: {feedback: userFeedback} }, 
            { new: true }
        )
        .populate("feedback.feedbackBy", "_id fullName")
        .exec();
        res.json(result);
    } catch (error) {
        res.status(400).json({error: error});
    }
});

module.exports = router;