const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const refreshSchema = mongoose.Schema(
    {
        token: {
            type: String,
            required: true
        },
        userId : {
            type : Schema.Types.ObjectId,
            ref : 'User'
        }
    }, 
    { timestamps: true }
)


const Refresh = mongoose.model('Refresh', refreshSchema );

module.exports = Refresh;