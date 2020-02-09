const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const multer = require("multer");
var upload = multer({ dest: 'controllers/certificates/' });
// const adminController = require('../controllers/admin');
const isAuth = require('./../middleware/uidai-auth');
const router = express.Router();
const uidaiController = require("./../controllers/uidai");

// Login routes
router.post("/signup",uidaiController.signupUidai);
router.post("/login",    [
      body('email').isString().isLength({min: 3}).trim(),
      body('password').isLength({min: 3}).trim(),
    ],uidaiController.loginUidai);
// router.post("/generate", upload.single('file'), uidaiController.addMarksheet);
router.post("/getRequests", isAuth,uidaiController.getPendingRequests);
router.post("/getTheRequest", isAuth,uidaiController.getTheRequest);
router.post("/getAllRequest", isAuth,uidaiController.getAcceptedRequests);
router.post("/responseToRequest", isAuth ,uidaiController.respondToRequest);
module.exports = router;
