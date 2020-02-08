const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const multer = require("multer");
var upload = multer({ dest: 'uploads/' });
// const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const router = express.Router();
const hospiController = require("./../controllers/hospi");

// Login routes
router.post("/signup", hospiController.signupHospi);
router.post("/login",    [
      body('email').isString().isLength({min: 3}).trim(),
      body('password').isLength({min: 3}).trim(),
    ],hospiController.loginHospi);
router.post("/generate",upload.single('file'),hospiController.generateUID);
module.exports = router;
