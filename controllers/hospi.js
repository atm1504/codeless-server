const mongoose = require('mongoose');
const fileHelper = require('../utilities/util');

const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const Hospi = require('../models/hospi'); // Hospital database
const user = require("../models/user");

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
            res.status(202).json({
                message:"Hospital created"
            });
            return true;
        })
        .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
}

exports.loginHospi = (req, res, net) => {
    const email = reg.body.email;
    const password = req.body.password;
    
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {title: title, price: price, description: description},
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
    }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
    }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product.save()
      .then(result => {
        console.log('Created Product');
        res.redirect('/admin/products');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};

exports.getProducts = (req, res, next) => {
  Product
      .find({userId: req.user._id})
      // .select('title price -_id')
      // .populate('userId', 'name')
      .then(products => {
        console.log(products);
        res.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products'
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
      .then(product => {
        if (!product) {
          return next(new Error('Product not found'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id: prodId, userId: req.user._id})
      })
      .then(() => {
        console.log('DESTROYED PRODUCT');
        res.status(200).json({message: 'Success!'});
      })
      .catch(err => {
        res.status(500).json({message: 'Failed'});
      });


};
