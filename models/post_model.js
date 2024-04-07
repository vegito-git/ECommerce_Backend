const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    feedback: [
        {
            userRating: Number,
            commentText: String,
            feedbackBy: {type: ObjectId, ref: "UserModel"},
            feedbackOn: Date,
            default: {}
        }
    ],
    rating: {
        type: Number,
        default:0
    }
});

mongoose.model("PostModel", postSchema);
