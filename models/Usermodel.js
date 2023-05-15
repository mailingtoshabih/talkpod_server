const mongoose = require('mongoose');



const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        name : {
            type : String,
            required : false
        },
        pic : {
            type : String,
            required : false
        },
        activated: {
            type: Boolean,
            required: false,
            default: false
        }
    }, 
    { timestamps: true }
)


const User = mongoose.model('User', userSchema );

module.exports = User;