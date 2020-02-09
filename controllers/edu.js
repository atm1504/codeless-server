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

exports.addCertificate = (req, res, net) => {
    const uid = req.body.uid;
    const type = req.body.type;
    const image = req.file;
    
    const img_temp_url = req.file.path;
    const base_name = img_temp_url.split("/");
    const url = path.join(__dirname, "certificates", base_name[2]);
    var formData = {
        i_key: uid,
        quali_type: type
    };
    var parent_res = res;
    needle.post('http://192.168.137.54:8888/quali/admin/addquali',
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
            const photo = res.body.result.Key;
            // console.log(url);
            // console.log(path.join(__dirname, "certificates", String(photo)));
            fs.renameSync(url, path.join(__dirname, "certificates", photo + ".png"));
            return parent_res.status(202).json({
                status: 202,
                message: "Success."
            });
        });
}