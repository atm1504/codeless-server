const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const multer = require("multer");
var upload = multer({ dest: 'controllers/certificates/' });
// const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const router = express.Router();
const hospiController = require("./../controllers/hospi");

// Login routes
router.post("/signup", hospiController.signupHospi);
router.get("/login",hospiController.loginHospi);
router.post("/generate", upload.single('file'), hospiController.generateUID);
router.post("/addReport",upload.single('file'),hospiController.addCertificates);
module.exports = router;
