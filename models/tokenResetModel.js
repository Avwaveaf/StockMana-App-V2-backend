const mongoose = require("mongoose")

const tokenResetSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users"
    },
    tokenReset: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required:true
    },
    expiredAt: {
        type: Date,
        required:true
    },

})

const TokenReset = mongoose.model("tokenReset", tokenResetSchema)
module.exports= TokenReset