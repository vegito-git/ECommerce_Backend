const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CartModel = mongoose.model('CartModel');
const protectedRoute = require('../middleware/protectedResource'); 

router.put("/addToCart",protectedRoute, async (req,res)=> {
    const {productId,quantity} = req.body;
    if(!productId || !quantity){
        res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    try {
        const cartProduct = await CartModel.findOne({user: req.user._id})
        .populate("productId", "productName price image rating")
        if(!cartProduct){
            const cartObj = new CartModel({user: req.user._id, productId, quantity})
            cartObj.save()
            .then((newCart)=> {
                res.status(201).json({cartItem: newCart});
            })
            .catch((error)=> {
                console.log(error);
            })
        }else{
            const searchProduct = await CartModel.findOne({productId: req.body.productId, user: req.user._id})
            .populate("productId", "productName price image rating")
            if(!searchProduct){
                const cartObj2 = new CartModel({user: req.user._id, productId, quantity})
                cartObj2.save()
                .then((newCart)=> {
                    res.status(201).json({cartItem: newCart});
                })
                .catch((error)=> {
                    console.log(error);
                })
            }else{                
                const qnt = searchProduct;
                await searchProduct.updateOne({$inc: {quantity: req.body.quantity}})
                res.status(200).json({result: qnt});
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

//This API can also fetch user Feedback......................

router.get("/myCartItems",protectedRoute, (req,res)=> {
    CartModel.find({user: req.user._id})
    .populate("productId", "productName price image description rating")
    .then((cartItem)=> {
        res.status(200).json({item: cartItem})
    })
    .catch((error)=> {
        console.log(error);
    })
});

router.post("/removeOneCartItem",protectedRoute, async (req,res)=> {
    const {productId,quantity, price} = req.body;
    if(!productId || !quantity || !price){
        res.status(400).json({error: "One or more mandatory fields are empty"});
    }
    try {
        const cartProduct = await CartModel.findOne({user: req.user._id})
        .populate("user", "productId");
        if(!cartProduct){
            res.status(500).json({error: "No items left.."})
        }else{
            const qnt = await CartModel.updateOne({$inc: {quantity: -1}})
            res.status(200).json({result: qnt});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

router.delete("/removefromCart/:productId", protectedRoute, async (req,res)=> {
    try {
        const itemFound = await CartModel.findOne({productId: req.params.productId})
        .populate("user", "productId");
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

module.exports = router;