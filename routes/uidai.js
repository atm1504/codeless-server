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
router.post("/login",uidaiController.loginUidai);
// router.post("/generate", upload.single('file'), uidaiController.addMarksheet);
router.post("/getRequests", isAuth,uidaiController.getPendingRequests);
router.post("/getTheRequest", isAuth,uidaiController.getTheRequest);
router.post("/getAcceptedRequest", isAuth,uidaiController.getAcceptedRequests);
router.post("/responseToRequest", isAuth, uidaiController.respondToRequest);
router.post("/verify", isAuth ,uidaiController.uidAdminVerify);
module.exports = router;
