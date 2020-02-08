const path = require('path');
const express = require('express');
const {body} = require('express-validator');
// const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const router = express.Router();
const hospiController = require("./../controllers/hospi");

// Login routes
router.post("/signup",hospiController.signupHospi);

module.exports = router;
