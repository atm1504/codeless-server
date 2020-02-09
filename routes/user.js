const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const multer = require("multer");
var upload = multer({ dest: 'controllers/certificates/' });
// const adminController = require('../controllers/admin');
// const isAuth = require('./../middleware/uidai-auth');
const router = express.Router();
const userController = require("./../controllers/user.js");

// Login routes
// router.post("/addQualification",upload.single('file'),eduController.addCertificate);

module.exports = router.get("/getState",userController.getData);