const mongoose = require('mongoose');
var fs = require('fs-extra');
const path = require("path");
const fileHelper = require('../utilities/util');
var needle = require('needle');
// const multer = require('multer');
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
    console.log(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Login failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.query.email;
    const password = req.query.password;
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
                    return res.status(202).json({
                        status: 202,
                        message: "User logged in successfully.",
                        access_token: user._id,
                        email: email
                    })
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

function isAuth(access_token) {
    Hospi.findById(access_token)
        .then(hosp => {
            if (!hosp) {
                return false
            } else {
                return true
            }
        }).catch(err => {
            return false;
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
    const doctor_number = req.body.doctor_number;
    const birth_cert = req.body.birth_cert;
    const parent = req.body.parent;
    const address = req.body.address;
    const phone = req.body.phone;
    const email = req.body.email;
    const name = req.body.name;
    const image = req.file;

    console.log(isAuth(access_token));
    Hospi.findById(access_token)
        .then(hosp => {
            if (!hosp) {
            return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        });
            } else {
                var formData = {
        name: name,
        parent: parent,
        c_address: address,
        p_address: address,
        phone: phone,
        dob: "12/21/2345",
        doctor:doctor_number
    }

    if (!req.file) {
        return res.status(404).json({
            status: 404,
            message: "Certificate not found"
        });
    }
    const img_temp_url = req.file.path;
    const base_name = img_temp_url.split("/");
    const url = path.join(__dirname,"certificates", base_name[2]);
    let uid;

    var parent_res = res;
    const time = String(new Date().getTime());
    needle.post('http://192.168.137.54:8888/hospital/admin/getdob',
        formData, { json: true }, (err, res) => {
            if (err) {
                console.error(err);
                return parent_res.status(500).json({
                    status: 500,
                    message: "Failes. Server crashed."
                });
            };
            if (res.body.status == 500) {
                return parent_res.status(500).json({
                    status: 500,
                    message: "Failes. Server crashed."
                });
            }

            // console.log(res.body);
            uid = res.body.result.IdentityID;
            const photo = res.body.result.dob_filename;
            // console.log(url);
            // console.log(path.join(__dirname, "certificates", String(photo)));
            fs.renameSync(url, path.join(__dirname, "certificates", photo + ".png"));
            flag = 1;
            const user = new User({
                name: name,
                phone: phone,
                email: email,
                uid: uid,
                parent: parent,
                address: address,
                time: time
            });
            user.save().then(result => {
            return parent_res.status(202).json({
                status: 202,
                message: "Success."
        });
            }).catch(err => {
                console.log(err);
            })
        });
            }
        }).catch(err => {
            return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        });
    })

    // if (isAuth(access_token) == false) {
    //     return res.status(401).json({
    //         status: 401,
    //         message: "Unauthorized access"
    //     });
    // }
    
}


// Generate uid
exports.addCertificates = (req, res, net) => {
    const access_token = req.body.access_token;
    const doctor_number = req.body.doctor_number;
    const type = req.body.type;
    const image = req.file;
    const uid = req.body.uid;

    console.log(isAuth(access_token));
    Hospi.findById(access_token)
        .then(hosp => {
            if (!hosp) {
                return res.status(401).json({
                status: 401,
                message: "Unauthorized access"
             });
            } else {
                var formData = {
                    i_key: uid,
                    doctor: doctor_number,
                    type: type
            }

        if (!req.file) {
            return res.status(404).json({
                status: 404,
                message: "Certificate not found"
            });
        }
        const img_temp_url = req.file.path;
        const base_name = img_temp_url.split("/");
        const url = path.join(__dirname,"certificates", base_name[2]);
        // let injury_url;

        var parent_res = res;
        const time = String(new Date().getTime());
        needle.post('http://192.168.137.54:8888/hospital/admin/addreports',
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
                    message: "Failed. Server crashed."
                });
            }

            // injury_url = res.body.result.IdentityID;
            const photo = res.body.result.Id;
            // console.log(url);
            // console.log(path.join(__dirname, "certificates", String(photo)));
            fs.renameSync(url, path.join(__dirname, "certificates", photo + ".png"));
            return parent_res.status(202).json({
                status: 202,
                message: "Success."
            });
        });
            }
        }).catch(err => {
            return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        });
    })

    // if (isAuth(access_token) == false) {
    //     return res.status(401).json({
    //         status: 401,
    //         message: "Unauthorized access"
    //     });
    // }
    
}