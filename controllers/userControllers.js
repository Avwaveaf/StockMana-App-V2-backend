const expressAsyncHandler = require('express-async-handler');
const { validate } = require('email-validator');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const TokenReset = require('../models/tokenResetModel');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// generate token handler
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// register user controller
exports.registerUser = expressAsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must up to 6 Character');
  }
  if (!validate(email)) {
    res.status(400);
    throw new Error('Please enter valid Email format');
  }

  //checking if user already exist
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('Conflict! User already exist, please login instead...');
  }

  // create new user
  const user = await User.create({
    username,
    email,
    password,
  });
  //generate token
  const token = generateToken(user._id);

  // send http-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // expires in 1 d
    sameSite: 'none',
    secure: true,
  });

  const {
    _id,
    username: name,
    email: emailAddress,
    bio,
    phone,
    imageUrl,
  } = user;

  if (user) {
    res.status(201).json({
      success: true,
      message: `Account created! Welcome ${name}`,
      data: {
        _id,
        name,
        emailAddress,
        bio,
        phone,
        imageUrl,
        token,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// login user controller
exports.loginUser = expressAsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must up to 6 Character');
  }
  if (!validate(email)) {
    res.status(400);
    throw new Error('Please enter valid Email format');
  }
  //checking if user exist
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    res.status(401);
    throw new Error('You are not registered yet. please register first...');
  }
  //checking if the password correct
  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );
  // generate token and asign http only cookie
  const token = generateToken(existingUser._id);
  // send http-only cookie when password is correct only
  if (isPasswordCorrect) {
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 1000 * 86400), // expires in 1 d
      secure: true,
    });
  }

  if (existingUser && isPasswordCorrect) {
    const {
      _id,
      username: name,
      email: emailAddress,
      bio,
      phone,
      imageUrl,
    } = existingUser;
    res.status(200).json({
      success: true,
      message: `Login Success! Welcome ${name}`,
      data: {
        _id,
        name,
        emailAddress,
        bio,
        phone,
        imageUrl,
        token,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid Email or Password');
  }
});

// log out user controller
exports.logoutUser = expressAsyncHandler(async (req, res) => {
  res.cookie('token', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'none',
    expires: new Date(0), // set expired
    secure: process.env.NODE_ENV,
    domain: req.headers.host.split(":")[0],
  });
  res.status(200).json({
    success: true,
    message: 'Successfully Logged out... See ya!',
  });
});

// get user data controller
exports.getUser = expressAsyncHandler(async (req, res) => {
  //get user data by id
  const user = await User.findById(req.user._id);
  if (user) {
    const {
      _id,
      username: name,
      email: emailAddress,
      bio,
      phone,
      imageUrl,
    } = user;
    res.status(200).json({
      success: true,
      data: {
        _id,
        name,
        emailAddress,
        bio,
        phone,
        imageUrl,
      },
    });
  } else {
    res.status(400);
    throw new Error('User are not found!');
  }
});

//  get login status
exports.getLoginStatus = expressAsyncHandler(async (req, res) => {
  // get token on cookies
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  //verify token
  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (verifiedToken) {
    return res.json(true);
  }
  return res.json(false);
});

// update profile user
exports.updateProfile = expressAsyncHandler(async (req, res) => {
  const { username, email, bio, phone, imageUrl, password } = req.body;
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        username: username || this.username,
        bio: bio || this.bio,
        phone: phone || this.phone,
        imageUrl: imageUrl || this.imageUrl,
      },
    },
    { new: true }
  );

  // deny email change input
  if (email) {
    res.status(400);
    throw new Error('You cannot change your email!');
  }
  if (password) {
    res.status(400);
    throw new Error("You can't change your password here..");
  }
  if (!user) {
    res.status(404);
    throw new Error('User Not found!');
  } else {
    //upodate user
    res.status(200).json({
      success: true,
      message: 'User profile updated successfully!!',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        phone: user.phone,
        imageUrl: user.imageUrl,
      },
    });
  }
});

// change password
exports.changePassword = expressAsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  //val;idate all password input
  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Please fill all fields before changing the password..');
  }

  // Validate the new password
  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  // find user by id and retreive their passwoerd
  const user = await User.findOne({ _id: req.user._id });

  //checking if the user exist
  if (!user) {
    res.status(400);
    throw new Error('User not found please register first...');
  }

  //compare with the password stored in db
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    res.status(400);
    throw new Error('Incorrect Password!');
  }

  //update user document to new password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully!',
  });
});

// forgot password
exports.forgotPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  // validate email\
  if (!email) {
    res.status(400);
    throw new Error('Please add an email address');
  }

  // find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error('You are not registered yet. Please register first');
  }

  //delete token if already exist before asigning a new one
  let token = await TokenReset.findOne({ userId: user._id });

  if (token) {
    await TokenReset.deleteOne();
  }

  //   create token reset
  let resetToken = crypto.randomBytes(32).toString('hex') + user._id;

  //hashing password before going to db
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // saving token to db
  await new TokenReset({
    userId: user._id,
    tokenReset: hashedToken,
    createdAt: Date.now(),
    expiredAt: Date.now() + 30 * (60 * 1000), // expired at 30 minutes
  }).save();

  // constructing reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // construct reset pwd request email
  const message = `
  <div style="
  background-color: #444654;
  opacity: 1;
  background-image:  repeating-radial-gradient( circle at 0 0, transparent 0, #444654 22px ), repeating-linear-gradient( #ffffff55, #ffffff );
  
    padding:20px 80px;
    font-family: Arial, sans-serif;
    text-align: center;
 
  ">
  <div style="
  background-color: rgb(32,33,35);
  padding:20px;
  border-radius: 25px;
  ">
  <h1 style="
  color:whitesmoke;
  ">[Stock Mana] Your Inventory Management Solution</h1>
  <p style="
  color:whitesmoke;
    font-size: 18px;
  ">You recently requested to reset your password. Please use the following url to reset it:</p>
  <h2 style="
    background-color: #333;
    color:whitesmoke;
    padding: 20px;
   
    font-size: 22px;
    margin-top: 20px;
    margin-bottom: 20px;
  "><a href='${resetUrl}' style=" color: #fff;" clickTracking=off>${resetUrl}</a></h2>
  <p style="
  color:whitesmoke;
    font-size: 18px;
  ">If you did not request a password reset, please ignore this email. this reset request url only valid for 30 minutes</p>
  <p style="
  color:whitesmoke;
  font-size: 18px;
">Regards,</p>
  <p style="
    color: yellow;
    font-size: 18px;
  ">Stock Mana dev Team [Afif]</p>
  
  </div>

  </div>
`;
  const subject = '[Stock-Mana] Password Reset Request';
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  //send reset password email
  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({
      success: true,
      message:
        'Your Reset Password Url has been sent to your email. check your email or spam.',
    });
  } catch (error) {
    res.status(500);
    throw new Error('Email not sent, please try again later...');
  }
});

//reset password
exports.resetPassword = expressAsyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;
 

  if (!password) {
    res.status(400)
    throw new Error("Please enter your Password")
  }

  // hashed resetToken before comparing it with DB
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  //getting the similar token on the db
  const userToken = await TokenReset.findOne({
    tokenReset: hashedToken,
      expiredAt: {$gt:Date.now()}
  })

  if (!userToken) { 
      res.status(404);
      throw new Error("Invalid token or Expired");
  }

  // find user in db
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    success:true,
    message: "Password reset successful, please login."
  });
});