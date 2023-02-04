const expressAsyncHandler = require('express-async-handler');
const { validate } = require('email-validator');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const protectRoute = expressAsyncHandler(async (req, res, next) => {
  try {
    // check if request has token
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error(
        'You are not authorized, Please Login or Register first..'
      );
    }

    //  verify token
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

    // get user by id token
    const user = await User.findById(verifiedToken.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User not found, Please Register first..');
    }

    // send user data to req
    req.user = user;

    next();
  } catch (error) {
    res.status(401);
    throw new Error(
      'You are not authorized, please Login or Register first...'
    );
  }
});

module.exports = protectRoute;
