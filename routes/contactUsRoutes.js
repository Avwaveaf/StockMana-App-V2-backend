const { contactUs } = require('../controllers/contactUsControllers');
const protectRoute = require('../middlewares/authMiddleware');
const router = require('express').Router();

router.post("/", protectRoute, contactUs)

module.exports= router