const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const cartSchema = new mongoose.Schema({
    user: {
        type: ObjectId, 
        ref: "UserModel"
    },
    productId: {
        type: ObjectId, 
        ref: "PostModel"
    },
    quantity: {
        type: Number,
        required: true
    }
},{timestamps:true});

mongoose.model("CartModel", cartSchema);
