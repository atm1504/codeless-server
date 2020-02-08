const mongoose = require('mongoose');
const fileHelper = require('../utilities/util');
const multer = require('multer');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const Hospi = require('../models/hospi'); // Hospital database
const User = require("../models/user");

exports.signupHospi = (req, res, net) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;
    const time = String(new Date().getTime());

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const hospi = new Hospi({
                name: name,
                phone: phone,
                email: email,
                password: hashedPassword,
                time:time
            });
            return hospi.save();
        })
        .then(result => {
            return res.status(202).json({
                status: "202",
                message:"Hospital created"
            });
            // res.status(202).json({message: message, data: data});
        })
        .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
}

// Login hospi admins
exports.loginHospi = (req, res, net) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Login failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    Hospi.findOne({ email: email })
        .then(user => {
            // CHeck if user is registered or not
            if (!user) {
                return res.status(422).json({
                    status: 422,
                    message: "User not found"
                });
            }
            // check password of the user
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        return res.status(401).json({
                            status: 401,
                            message: "Password field didn't match"
                        });
                    }
                    // let access_token;
                    const to_hash = email + password + String(new Date().getTime());
                    bcrypt.hash(to_hash, 12)
                        .then(hashme => {
                            user.accessToken = hashme;
                            user.save();
                            // console.log(access_token);
                            
                            return res.status(202).json({
                                status: 202,
                                message: "User logged in successfully.",
                                access_token: hashme,
                                email:email
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                });
        })
        .catch(err => {
            if (!err.statusCode) {
            err.statusCode = 500;
            }
            next(err);
        });
}

function isAuth(email, access_token) {
    Hospi.findOne({ email: email })
        .then(user => {
            if (!user) {
                return false
            }
            if (user.accessToken != access_token) {
                return false
            }
            return true
    })
}

const fileFilter = (mimetype) => {
  if (mimetype === 'image/png' || mimetype === 'image/jpg' ||
      mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Generate uid
exports.generateUID = (req, res, net) => {
    const admin_email = req.body.admin_email;
    const access_token = req.body.access_token;

    if (isAuth(admin_email, access_token) == false) {
        return res.status(401).json({
            status: 401,
            message: "PUnauthorized access"
        });
    }
    // Extract the data
    const doctor_number = req.body.doctor_number;
    const birth_cert = req.body.birth_cert;
    const parent = req.body.parent;
    const address = req.body.address;
    const phone = req.body.phone;
    const email = req.body.email;
    const name = req.body.name;

    if (!req.file) {
        return res.status(404).json({
            status: 404,
            message: "Certificate not found"
        });
    }

    /// Make call to BLockchain


    // End of blockchain call

    // Upload file variables;
    const fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'images');
        },
        filename: (req, file, cb) => {
            cb(null, new Date().getTime().toISOString() + '-' + file.originalname);
        }
    });
    var upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single('image');
    const time = String(new Date().getTime());
    // Creating the id
    const user = new User({
        name: name,
        phone: phone,
        email: email,
        uid: uid,
        parent: parent,
        address: address,
        time: time
    });
    user.save();

    return res.status(202).json({
        status: 202,
        message: "Successfully added the certificate"
    });
}