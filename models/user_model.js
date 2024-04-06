const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    profileImg: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_1280.png"
    },
    address: [
        {
            addressName: { type: String, default: "" },
            houseNo: { type: String, default: "" },
            area: { type: String, default: "" },
            city: { type: String, default: "" },
            country: { type: String, default: "" },
            pinCode: {type: Number, default: null},
            phoneNumber: { type: Number, default: null }
        }
    ],
    orders: [
        {
            productId: { type: ObjectId, ref: "PostModel" }
        }
    ]
});

mongoose.model("UserModel", userSchema);
