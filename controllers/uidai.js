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
                    return res.status(202).json({
                        status: 202,
                        message: "User logged in successfully.",
                        access_token: user._id,
                        email: email
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
    var parent_res = res;
    needle.get("http://192.168.137.54:8888/uidai/admin/getPendingRequest", (err, res) => {
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
        // console.log(res.body);
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
    var parent_res = res;
    console.log("test-2");
    needle.get("http://192.168.137.54:8888/uidai/admin/getAcceptRequest", (err, res) => {
        console.log(res);
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

exports.respondToRequest = (req, res, net) => {
    const errors = validationResult(req);
    const admin_email = req.body.admin_email;
    const access_token = req.body.access_token;
    const req_id = req.body.req_id;
    const response = req.body.response;
    
    if (!errors.isEmpty()) {
        const error = new Error('Login failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    var date;
    if (response == "-1") {
        date ="21/43/56"
    } else {
        date = req.body.date;
    }
    var formData = {
        req_id: req_id,
        given_date: date,
        response:response
    }
    var parent_res = res;
    needle.post('http://192.168.137.54:8888/uidai/admin/responRequest',
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
            result: res.body.result
            });

    });
}

exports.uidAdminVerify = (req, res, net) => {
    const errors = validationResult(req);
    const req_id = req.body.req_id;
    if (!errors.isEmpty()) {
        const error = new Error('Login failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    var formData = {
        req_id: req_id
    }
    var parent_res = res;
    needle.post('http://192.168.137.54:8888/uidai/admin/verify',
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
                result: res.body
            });
    });
}