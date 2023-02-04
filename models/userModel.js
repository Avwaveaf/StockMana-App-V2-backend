const mongoose = require('mongoose');
const bcrypt =require("bcryptjs")

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please enter your username'],
        },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true,
            trim: true,
            match: [
                /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/,
                'Please enter a valid email address format',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password cannot be empty'],
            minLength: [6, 'Password must be up to 6 characters'],
        },
        imageUrl: {
            type: String,
            required: [true, 'Please add a Profile Picture'],
            default: 'https://i.ibb.co/4pDNDk1/avatar.png',
        },
        bio: {
            type: String,
            default:"My bio",
            maxLength:[250,"Bio cannot contain more than 250 characters"]
        },
        phone: {
            type: String,
            default:"+62 123"
        }
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
     }
        //Password encryption before save
        const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword
    next()
 })

const User = mongoose.model('users', userSchema);
module.exports = User;
