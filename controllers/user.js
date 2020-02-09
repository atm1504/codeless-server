const mongoose = require('mongoose');
var fs = require('fs-extra');
const path = require("path");
const fileHelper = require('../utilities/util');
var needle = require('needle');
// const multer = require('multer');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// const Hospi = require('../models/'); // Hospital database
const User = require("../models/user");

const fileFilter = (mimetype) => {
  if (mimetype === 'image/png' || mimetype === 'image/jpg' ||
      mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

exports.getData = (req, res, net) => {
    const uid = req.query.uid;
    var formData = {
        key: uid
    };
    var parent_res = res;
    console.log(formData);
    needle.post('http://192.168.137.54:8888/uidai/user',
        formData, { json: true }, (err, res) => {
            // console.log(err, res);
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
            return parent_res.status(202).json({
                status: 202,
                message: "Success.",
                result:res.body.result
            });
        });
}