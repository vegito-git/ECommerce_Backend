const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
        type: String,
        required: true
    },
    profileImg: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_1280.png"
    },
});

mongoose.model("AdminModel", adminSchema);
