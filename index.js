const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const {MONGODB_URL} = require('./config');

mongoose.connect(MONGODB_URL);
mongoose.connection.on('connected', ()=> {
    console.log("DB Connected...");
});
mongoose.connection.on('error', (error)=> {
    console.log("Error while connecting to the database");
});

app.use(cors());
app.use(express.json());

require('./models/admin_model');
require('./models/user_model');
require('./models/post_model');
require('./models/cart_model');

app.use(require('./routes/admin_route'));
app.use(require('./routes/user_route'));
app.use(require('./routes/post_route'));
app.use(require('./routes/cart_route'));

app.listen(4000, ()=> {
    console.log("Server has started...");
});
