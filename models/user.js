const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
});

userSchema.plugin(passportLocalMongoose);
//THIS ADDS USERNAME AND PASSWORD FIELDS TO THE SCHEMA, AS WELL AS SOME METHODS FOR AUTHENTICATION

module.exports = mongoose.model("User", userSchema);