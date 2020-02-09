const mongoose = require('mongoose');
var fs = require('fs-extra');
const path = require("path");
const fileHelper = require('../utilities/util');
var needle = require('needle');
// const multer = require('multer');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const Uidai = require('../models/uidai'); // Uidaital database
const User = require("../models/user");

exports.signupUidai = (req, res, net) => {
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
            const uidai = new Uidai({
                name: name,
                phone: phone,
                email: email,
                password: hashedPassword,
                time:time
            });
            return uidai.save();
        })
        .then(result => {
            return res.status(202).json({
                status: "202",
                message:"Uid data logged created"
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

// Login Uidai admins
exports.loginUidai = (req, res, net) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Login failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    Uidai.findOne({ email: email })
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
    Uidai.findOne({ email: email })
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
exports.getPendingRequests = (req, res, net) => {
    const errors = validationResult(req);
    const admin_email = req.body.admin_email;
    const access_token = req.body.access_token;
    if (!errors.isEmpty()) {
        const error = new Error('Login failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    if (isAuth(admin_email, access_token) == false) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        });
    }
    var parent_res = res;
    console.log("test-2");
    needle.get("http://192.168.137.54:8888/uidai/admin/getPendingRequest", (err, res) => {
        console.log("test-1");
        if (err) {
            return parent_res.status(500).json({
                status: 500,
                message: err.message
            });
        };
        if (res.body.status == 500) {
            return parent_res.status(500).json({
                status: 500,
                message: "Failed. Server crashed."
            });
        }
        console.log(res.body);
        return parent_res.status(202).json({
            status: 202,
            message: "Done",
            requests: res.body.result
            });
    });
}
exports.getTheRequest = (req, res, net) => {
    const admin_email = req.body.admin_email;
    const access_token = req.body.access_token;
    const r_key = req.body.r_key;

    if (isAuth(admin_email, access_token) == false) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        });
    }
    var formData = {
        r_key: r_key
    }

    var parent_res = res;
    needle.post('http://192.168.137.54:8888/uidai/getTheRequest',
        formData, { json: true }, (err, res) => {
            if (err) {
                console.error(err);
                return parent_res.status(500).json({
                    status: 500,
                    message: "Failed. Server crashed."
                });
            };
            if (res.body.status == 500) {
                return parent_res.status(500).json({
                    status: 500,
                    message: "Failed. Server crashed.",
                    err:res.body
                });
            }
            return parent_res.status(200).json({
                    status: 200,
                    message: "Success",
                    result:res.body.result
                });

        });
}

exports.getAcceptedRequests = (req, res, net) => {
    const errors = validationResult(req);
    const admin_email = req.body.admin_email;
    const access_token = req.body.access_token;
    if (!errors.isEmpty()) {
        const error = new Error('Login failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    if (isAuth(admin_email, access_token) == false) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        });
    }
    var parent_res = res;
    console.log("test-2");
    needle.get("http://192.168.137.54:8888/uidai/admin/getAcceptRequest", (err, res) => {
        console.log("test-1");
        if (err) {
            return parent_res.status(500).json({
                status: 500,
                message: err.message
            });
        };
        if (res.body.status == 500) {
            return parent_res.status(500).json({
                status: 500,
                message: "Failed. Server crashed."
            });
        }
        console.log(res.body);
        return parent_res.status(202).json({
            status: 202,
            message: "Done",
            request: res.body.result
            });
    });
}